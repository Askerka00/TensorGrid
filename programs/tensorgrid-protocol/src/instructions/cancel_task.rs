use anchor_lang::prelude::*;
use crate::state::{ComputeNode, TaskEscrow, TaskStatus, NodeStatus};
use crate::errors::TensorGridError;

#[derive(Accounts)]
pub struct CancelTask<'info> {
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

    /// CHECK: Original client to receive the full refund
    #[account(
        mut,
        constraint = client.key() == task_escrow.client @ TensorGridError::Unauthorized
    )]
    pub client: AccountInfo<'info>,

    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CancelTask>) -> Result<()> {
    let escrow = &mut ctx.accounts.task_escrow;
    require!(
        escrow.status == TaskStatus::Pending || escrow.status == TaskStatus::Computing,
        TensorGridError::InvalidTaskStatus
    );

    let current_time = Clock::get()?.unix_timestamp;
    let is_client = ctx.accounts.authority.key() == escrow.client;
    let is_expired = (current_time - escrow.started_at) > (escrow.max_duration_sec as i64);

    require!(is_client || is_expired, TensorGridError::Unauthorized);

    let refund_amount = escrow.deposited_amount;

    // Refund full remaining deposit back to client
    **ctx.accounts.task_escrow.to_account_info().try_borrow_mut_lamports()? -= refund_amount;
    **ctx.accounts.client.to_account_info().try_borrow_mut_lamports()? += refund_amount;

    escrow.status = TaskStatus::Refunded;
    escrow.completed_at = current_time;

    let node = &mut ctx.accounts.compute_node;
    node.status = NodeStatus::Active;

    msg!("Task Escrow {:?} refunded: {} lamports returned to client.", escrow.task_id, refund_amount);
    Ok(())
}
