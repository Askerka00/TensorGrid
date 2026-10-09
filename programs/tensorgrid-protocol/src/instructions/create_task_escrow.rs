use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::state::{ComputeNode, TaskEscrow, TaskStatus, NodeStatus};
use crate::errors::TensorGridError;

#[derive(Accounts)]
#[instruction(task_id: [u8; 32])]
pub struct CreateTaskEscrow<'info> {
    #[account(
        mut,
        seeds = [b"compute-node", compute_node.node_id.as_ref()],
        bump = compute_node.bump
    )]
    pub compute_node: Account<'info, ComputeNode>,

    #[account(
        init,
        payer = client,
        space = TaskEscrow::LEN,
        seeds = [b"task-escrow", task_id.as_ref()],
        bump
    )]
    pub task_escrow: Account<'info, TaskEscrow>,

    #[account(mut)]
    pub client: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateTaskEscrow>,
    task_id: [u8; 32],
    deposit_amount: u64,
    max_duration_sec: u64,
    workload_type: String,
) -> Result<()> {
    let node = &mut ctx.accounts.compute_node;
    require!(node.status == NodeStatus::Active, TensorGridError::NodeNotActive);

    let rate_per_sec = node.rate_per_hour_lamports / 3600;
    let required_amount = rate_per_sec.checked_mul(max_duration_sec).ok_or(TensorGridError::ArithmeticOverflow)?;
    require!(deposit_amount >= required_amount, TensorGridError::InsufficientEscrowFunds);

    // Transfer SOL deposit from client into TaskEscrow PDA
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.client.to_account_info(),
            to: ctx.accounts.task_escrow.to_account_info(),
        },
    );
    transfer(cpi_context, deposit_amount)?;

    let escrow = &mut ctx.accounts.task_escrow;
    escrow.task_id = task_id;
    escrow.client = ctx.accounts.client.key();
    escrow.assigned_node = node.key();
    escrow.deposited_amount = deposit_amount;
    escrow.max_duration_sec = max_duration_sec;
    escrow.rate_per_sec = rate_per_sec;
    escrow.workload_type = workload_type;
    escrow.status = TaskStatus::Computing;
    escrow.started_at = Clock::get()?.unix_timestamp;
    escrow.completed_at = 0;
    escrow.proof_hash = [0u8; 32];
    escrow.bump = ctx.bumps.task_escrow;

    node.status = NodeStatus::Busy;

    msg!("Task Escrow {:?} locked with {} lamports!", task_id, deposit_amount);
    Ok(())
}
