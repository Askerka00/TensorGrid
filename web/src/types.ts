export type ProductStatus = 'In Stock' | 'Out of Stock' | 'Restock';

export interface Product {
  id: string;
  name: string;
  price: number;
  sales: number;
  revenue: number;
  stock: number;
  status: ProductStatus;
  rating: number;
  selected?: boolean;
}

export type NodeStatus = 'COMPUTING' | 'IDLE' | 'OFFLINE';

export interface NodeInfo {
  id: string;
  ip: string;
  gpu: string;
  vram: string;
  status: NodeStatus;
  wallet: string;
  totalEarnedUsdc: number;
  totalComputeSec: number;
  lastHeartbeat: number;
  currentTask?: string;
  selected?: boolean;
}

export interface PayoutResult {
  success: boolean;
  signature?: string;
  amountLamports?: number;
  amountSol?: number;
  recipient: string;
  explorerUrl?: string;
  error?: string;
  timestamp?: number;
}

export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  changeText: string;
  changeType: 'positive' | 'negative' | 'neutral';
}
