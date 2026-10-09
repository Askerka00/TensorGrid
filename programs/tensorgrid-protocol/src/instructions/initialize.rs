use anchor_lang::prelude::*;
use crate::state::ProtocolConfig;
use crate::errors::TensorGridError;

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(
        init,
        payer = admin,
        space = ProtocolConfig::LEN,
        seeds = [b"tensorgrid-config"],
        bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: Treasury wallet safe check
    pub treasury: AccountInfo<'info>,

    /// CHECK: Insurance pool wallet safe check
    pub insurance_pool: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeProtocol>,
    provider_fee_bps: u16,
    protocol_fee_bps: u16,
    insurance_fee_bps: u16,
) -> Result<()> {
    require!(
        provider_fee_bps + protocol_fee_bps + insurance_fee_bps == 10_000,
        TensorGridError::InvalidFeeDistribution
    );

    let config = &mut ctx.accounts.config;
    config.admin = ctx.accounts.admin.key();
    config.treasury = ctx.accounts.treasury.key();
    config.insurance_pool = ctx.accounts.insurance_pool.key();
    config.provider_fee_bps = provider_fee_bps;
    config.protocol_fee_bps = protocol_fee_bps;
    config.insurance_fee_bps = insurance_fee_bps;
    config.total_nodes = 0;
    config.total_tasks_completed = 0;
    config.total_volume_lamports = 0;
    config.bump = ctx.bumps.config;

    msg!("TensorGrid Protocol initialized with 70/20/10 economics!");
    Ok(())
}
