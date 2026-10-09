use anchor_lang::prelude::*;

#[account]
pub struct ProtocolConfig {
    /// Protocol governance authority
    pub admin: Pubkey,
    /// Protocol treasury wallet for infrastructure & maintenance
    pub treasury: Pubkey,
    /// Insurance / Slashing reserve pool
    pub insurance_pool: Pubkey,
    /// Provider reward share in basis points (7000 = 70%)
    pub provider_fee_bps: u16,
    /// Protocol treasury share in basis points (2000 = 20%)
    pub protocol_fee_bps: u16,
    /// Insurance / Staking share in basis points (1000 = 10%)
    pub insurance_fee_bps: u16,
    /// Total registered compute nodes
    pub total_nodes: u64,
    /// Total tasks processed and settled
    pub total_tasks_completed: u64,
    /// Total compute volume settled in lamports
    pub total_volume_lamports: u64,
    /// PDA bump seed
    pub bump: u8,
}

impl ProtocolConfig {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 2 + 2 + 2 + 8 + 8 + 8 + 1;
}

#[account]
pub struct ComputeNode {
    /// Owner of the compute hardware (club manager / individual)
    pub authority: Pubkey,
    /// Designated payout wallet for rewards
    pub payout_wallet: Pubkey,
    /// Unique node identifier hash
    pub node_id: [u8; 32],
    /// Hardware model string (e.g., "NVIDIA GeForce RTX 4080")
    pub hardware_name: String,
    /// Dedicated VRAM in Gigabytes
    pub vram_gb: u16,
    /// Hardware tier: 0 = CPU, 1 = GPU DirectML, 2 = NVIDIA CUDA High-Tier
    pub tier: u8,
    /// Hourly compute rate in lamports
    pub rate_per_hour_lamports: u64,
    /// Current node operational status
    pub status: NodeStatus,
    /// Total lifetime compute seconds delivered
    pub total_compute_seconds: u64,
    /// Total lifetime earnings in lamports
    pub total_earned_lamports: u64,
    /// Total successful tasks completed
    pub tasks_completed: u32,
    /// Registration timestamp
    pub registered_at: i64,
    /// PDA bump seed
    pub bump: u8,
}

impl ComputeNode {
    pub const LEN: usize = 8 + 32 + 32 + 32 + (4 + 64) + 2 + 1 + 8 + 1 + 8 + 8 + 4 + 8 + 1;
}

#[account]
pub struct TaskEscrow {
    /// Unique 32-byte task identifier
    pub task_id: [u8; 32],
    /// AI developer / client who funded the task
    pub client: Pubkey,
    /// Compute node assigned to execute the workload
    pub assigned_node: Pubkey,
    /// Total amount locked in escrow for this task
    pub deposited_amount: u64,
    /// Maximum allowed duration in seconds before auto-refund
    pub max_duration_sec: u64,
    /// Compute rate per second in lamports
    pub rate_per_sec: u64,
    /// Workload category (e.g., "PyTorch Inference", "Blender 3D")
    pub workload_type: String,
    /// Lifecycle status of the task
    pub status: TaskStatus,
    /// Execution start timestamp
    pub started_at: i64,
    /// Execution settlement timestamp
    pub completed_at: i64,
    /// Cryptographic proof-of-computation hash
    pub proof_hash: [u8; 32],
    /// PDA bump seed
    pub bump: u8,
}

impl TaskEscrow {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 8 + (4 + 32) + 1 + 8 + 8 + 32 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum NodeStatus {
    Active,
    Busy,
    Suspended,
    Offline,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TaskStatus {
    Pending,
    Computing,
    Completed,
    Cancelled,
    Refunded,
}
