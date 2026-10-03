import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';
dotenv.config();

const RPC_ENDPOINTS = [
  process.env.SOLANA_RPC,
  'https://api.devnet.solana.com',
  'https://rpc.ankr.com/solana_devnet',
].filter(Boolean) as string[];

let currentRpcIndex = 0;
function getConnection(): Connection {
  const rpc = RPC_ENDPOINTS[currentRpcIndex % RPC_ENDPOINTS.length];
  return new Connection(rpc, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
}

let connection = getConnection();
let payerKeypair: Keypair | null = null;

const decodeBase58 = (str: string): Uint8Array => {
  const decoder = (bs58 as any).decode || (bs58 as any).default?.decode;
  return decoder(str);
};

export function initPayer(): Keypair {
  const secret = process.env.SECRET_KEY;
  if (!secret) throw new Error('SECRET_KEY not found in .env');
  payerKeypair = Keypair.fromSecretKey(decodeBase58(secret));
  console.log(`[SOLANA] Payer wallet: ${payerKeypair.publicKey.toBase58()}`);
  return payerKeypair;
}

export async function airdropIfNeeded(): Promise<void> {
  if (!payerKeypair) initPayer();
  try {
    const balance = await connection.getBalance(payerKeypair!.publicKey);
    const balSol = balance / LAMPORTS_PER_SOL;
    console.log(`[SOLANA] Payer balance: ${balSol.toFixed(4)} SOL`);
    if (balSol < 0.05) {
      console.log('[SOLANA] Low balance, requesting airdrop 1 SOL on Devnet...');
      const sig = await connection.requestAirdrop(payerKeypair!.publicKey, LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig, 'confirmed');
      console.log('[SOLANA] Airdrop confirmed:', sig);
    }
  } catch (e: any) {
    console.warn('[SOLANA] Balance check/airdrop notice:', e.message);
  }
}

export interface PayoutResult {
  success: boolean;
  signature?: string;
  amountLamports: number;
  amountSol: number;
  recipient: string;
  explorerUrl?: string;
  error?: string;
}

// Send real SOL payout to node wallet (Devnet) with automatic retries on RPC failure
export async function sendPayout(recipientAddress: string, amountSol: number): Promise<PayoutResult> {
  if (!payerKeypair) initPayer();

  const amountLamports = Math.round(amountSol * LAMPORTS_PER_SOL);
  let lastError = '';

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Re-create connection if previous attempt failed
      if (attempt > 1) {
        currentRpcIndex++;
        connection = getConnection();
      }

      const recipient = new PublicKey(recipientAddress);
      const { blockhash } = await connection.getLatestBlockhash('confirmed');

      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: payerKeypair!.publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: payerKeypair!.publicKey,
          toPubkey: recipient,
          lamports: amountLamports,
        })
      );

      const signature = await sendAndConfirmTransaction(connection, tx, [payerKeypair!], {
        commitment: 'confirmed',
      });

      const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      console.log(`[SOLANA] ✅ Payout sent (attempt ${attempt}): ${amountSol} SOL -> ${recipientAddress}`);
      console.log(`[SOLANA] 🔗 Explorer: ${explorerUrl}`);

      return {
        success: true,
        signature,
        amountLamports,
        amountSol,
        recipient: recipientAddress,
        explorerUrl,
      };
    } catch (e: any) {
      lastError = e.message;
      console.warn(`[SOLANA] ⚠️ Payout attempt ${attempt} failed: ${e.message}`);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }

  console.error(`[SOLANA] ❌ All 3 payout attempts failed:`, lastError);
  return {
    success: false,
    amountLamports,
    amountSol,
    recipient: recipientAddress,
    error: lastError,
  };
}

export async function getBalance(address: string): Promise<number> {
  try {
    const pubkey = new PublicKey(address);
    const balance = await connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}
