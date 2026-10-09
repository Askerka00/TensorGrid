use anchor_lang::prelude::*;
use crate::state::{ProtocolConfig, ComputeNode, TaskEscrow, TaskStatus, NodeStatus};
use crate::errors::TensorGridError;

#[derive(Accounts)]
pub struct SettleTask<'info> {
    #[account(
        mut,
        seeds = [b"tensorgrid-config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(
        mut,
        seeds = [b"compute-node", compute_node.node_id.as_ref()],
        bump = compute_node.bump
    )]
    pub compute_node: Account<'info, ComputeNode>,

    #[account(
        mut,
        seeds = [b"task-escrow", task_escrow.task_id.as_ref()],
        bump = task_escrow.bump
    )]
    pub task_escrow: Account<'info, TaskEscrow>,

    /// CHECK: Node provider's payout wallet
    #[account(
        mut,
        constraint = payout_wallet.key() == compute_node.payout_wallet @ TensorGridError::Unauthorized
    )]
    pub payout_wallet: AccountInfo<'info>,

    /// CHECK: Protocol treasury wallet
    #[account(
        mut,
        constraint = treasury.key() == config.treasury @ TensorGridError::Unauthorized
    )]
    pub treasury: AccountInfo<'info>,

    /// CHECK: Insurance pool reserve wallet
    #[account(
        mut,
        constraint = insurance_pool.key() == config.insurance_pool @ TensorGridError::Unauthorized
    )]
    pub insurance_pool: AccountInfo<'info>,

    /// CHECK: Original client to refund unspent lamports
    #[account(
        mut,
        constraint = client.key() == task_escrow.client @ TensorGridError::Unauthorized
    )]
    pub client: AccountInfo<'info>,

    /// Verifier/Orchestrator authority or Node authority
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SettleTask>,
    actual_duration_sec: u64,
    proof_hash: [u8; 32],
) -> Result<()> {
    require!(proof_hash != [0u8; 32], TensorGridError::InvalidProofOfComputation);

    let escrow = &mut ctx.accounts.task_escrow;
    require!(escrow.status == TaskStatus::Computing, TensorGridError::InvalidTaskStatus);

    let config = &mut ctx.accounts.config;
    let node = &mut ctx.accounts.compute_node;

    // Calculate total earned amount based on actual compute seconds
    let total_cost = escrow.rate_per_sec.checked_mul(actual_duration_sec).ok_or(TensorGridError::ArithmeticOverflow)?;
    let earned_amount = std::cmp::min(total_cost, escrow.deposited_amount);
    let refund_amount = escrow.deposited_amount.saturating_sub(earned_amount);

    // 70 / 20 / 10 Revenue Split
    let provider_share = (earned_amount as u128)
        .checked_mul(config.provider_fee_bps as u128)
        .ok_or(TensorGridError::ArithmeticOverflow)?
        / 10_000;
    let protocol_share = (earned_amount as u128)
        .checked_mul(config.protocol_fee_bps as u128)
        .ok_or(TensorGridError::ArithmeticOverflow)?
        / 10_000;
    let insurance_share = earned_amount as u128 - provider_share - protocol_share;

    // Payout to Node Provider (70%)
    **ctx.accounts.task_escrow.to_account_info().try_borrow_mut_lamports()? -= provider_share as u64;
    **ctx.accounts.payout_wallet.to_account_info().try_borrow_mut_lamports()? += provider_share as u64;

    // Payout to Protocol Treasury (20%)
    **ctx.accounts.task_escrow.to_account_info().try_borrow_mut_lamports()? -= protocol_share as u64;
    **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += protocol_share as u64;

    // Payout to Insurance Pool (10%)
    **ctx.accounts.task_escrow.to_account_info().try_borrow_mut_lamports()? -= insurance_share as u64;
    **ctx.accounts.insurance_pool.to_account_info().try_borrow_mut_lamports()? += insurance_share as u64;

    // Refund unspent deposit back to client
    if refund_amount > 0 {
        **ctx.accounts.task_escrow.to_account_info().try_borrow_mut_lamports()? -= refund_amount;
        **ctx.accounts.client.to_account_info().try_borrow_mut_lamports()? += refund_amount;
    }

    // Update state
    escrow.status = TaskStatus::Completed;
    escrow.completed_at = Clock::get()?.unix_timestamp;
    escrow.proof_hash = proof_hash;

    node.status = NodeStatus::Active;
    node.total_compute_seconds = node.total_compute_seconds.saturating_add(actual_duration_sec);
    node.total_earned_lamports = node.total_earned_lamports.saturating_add(provider_share as u64);
    node.tasks_completed = node.tasks_completed.saturating_add(1);

    config.total_tasks_completed = config.total_tasks_completed.saturating_add(1);
    config.total_volume_lamports = config.total_volume_lamports.saturating_add(earned_amount);

    msg!(
        "Task Settled: Total: {} lamports | Provider(70%): {} | Treasury(20%): {} | Insurance(10%): {} | Refund: {}",
        earned_amount,
        provider_share,
        protocol_share,
        insurance_share,
        refund_amount
    );
    Ok(())
}
