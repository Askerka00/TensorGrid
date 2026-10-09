use anchor_lang::prelude::*;

#[error_code]
pub enum TensorGridError {
    #[msg("Fee distribution shares must sum up to exactly 10,000 basis points (100%).")]
    InvalidFeeDistribution,

    #[msg("Node is currently not active or available for tasks.")]
    NodeNotActive,

    #[msg("Task is not in a valid state for this operation.")]
    InvalidTaskStatus,

    #[msg("Insufficient escrow funds deposited for the requested compute duration.")]
    InsufficientEscrowFunds,

    #[msg("Unauthorized signer for this instruction.")]
    Unauthorized,

    #[msg("Proof-of-Computation hash cannot be empty or invalid.")]
    InvalidProofOfComputation,

    #[msg("Task has not expired yet; cannot force refund before max duration.")]
    TaskNotExpired,

    #[msg("Arithmetic overflow occurred during revenue split calculation.")]
    ArithmeticOverflow,

    #[msg("Hardware name string is too long (max 64 characters).")]
    HardwareNameTooLong,
}
