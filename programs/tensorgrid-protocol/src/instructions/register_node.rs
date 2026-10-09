use anchor_lang::prelude::*;
use crate::state::{ProtocolConfig, ComputeNode, NodeStatus};
use crate::errors::TensorGridError;

#[derive(Accounts)]
#[instruction(node_id: [u8; 32])]
pub struct RegisterNode<'info> {
    #[account(
        mut,
        seeds = [b"tensorgrid-config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(
        init,
        payer = authority,
        space = ComputeNode::LEN,
        seeds = [b"compute-node", node_id.as_ref()],
        bump
    )]
    pub compute_node: Account<'info, ComputeNode>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Payout wallet to receive mining & compute rewards
    pub payout_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RegisterNode>,
    node_id: [u8; 32],
    hardware_name: String,
    vram_gb: u16,
    tier: u8,
    rate_per_hour_lamports: u64,
) -> Result<()> {
    require!(hardware_name.len() <= 64, TensorGridError::HardwareNameTooLong);

    let node = &mut ctx.accounts.compute_node;
    node.authority = ctx.accounts.authority.key();
    node.payout_wallet = ctx.accounts.payout_wallet.key();
    node.node_id = node_id;
    node.hardware_name = hardware_name;
    node.vram_gb = vram_gb;
    node.tier = tier;
    node.rate_per_hour_lamports = rate_per_hour_lamports;
    node.status = NodeStatus::Active;
    node.total_compute_seconds = 0;
    node.total_earned_lamports = 0;
    node.tasks_completed = 0;
    node.registered_at = Clock::get()?.unix_timestamp;
    node.bump = ctx.bumps.compute_node;

    let config = &mut ctx.accounts.config;
    config.total_nodes = config.total_nodes.checked_add(1).ok_or(TensorGridError::ArithmeticOverflow)?;

    msg!("Compute Node {:?} registered successfully!", node_id);
    Ok(())
}
