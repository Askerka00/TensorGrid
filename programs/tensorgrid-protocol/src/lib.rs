use anchor_lang::prelude::*;

pub mod state;
pub mod errors;
pub mod instructions;

use instructions::*;

declare_id!("TnsrGrid11111111111111111111111111111111111");

#[program]
pub mod tensorgrid_protocol {
    use super::*;

    /// Initialize the TensorGrid protocol configuration & fee distributions
    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        provider_fee_bps: u16,
        protocol_fee_bps: u16,
        insurance_fee_bps: u16,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, provider_fee_bps, protocol_fee_bps, insurance_fee_bps)
    }

    /// Register a new GPU/CPU compute node to the DePIN network
    pub fn register_node(
        ctx: Context<RegisterNode>,
        node_id: [u8; 32],
        hardware_name: String,
        vram_gb: u16,
        tier: u8,
        rate_per_hour_lamports: u64,
    ) -> Result<()> {
        instructions::register_node::handler(ctx, node_id, hardware_name, vram_gb, tier, rate_per_hour_lamports)
    }

    /// Lock client deposit in an on-chain Escrow PDA for a compute task
    pub fn create_task_escrow(
        ctx: Context<CreateTaskEscrow>,
        task_id: [u8; 32],
        deposit_amount: u64,
        max_duration_sec: u64,
        workload_type: String,
    ) -> Result<()> {
        instructions::create_task_escrow::handler(ctx, task_id, deposit_amount, max_duration_sec, workload_type)
    }

    /// Verify Proof-of-Computation and settle earnings (70% Provider / 20% Protocol / 10% Insurance)
    pub fn settle_task(
        ctx: Context<SettleTask>,
        actual_duration_sec: u64,
        proof_hash: [u8; 32],
    ) -> Result<()> {
        instructions::settle_task::handler(ctx, actual_duration_sec, proof_hash)
    }

    /// Cancel task or timeout refund remaining deposit back to client
    pub fn cancel_task(ctx: Context<CancelTask>) -> Result<()> {
        instructions::cancel_task::handler(ctx)
    }
}
