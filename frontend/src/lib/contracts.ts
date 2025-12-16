// StackStream Contract Configuration
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
  ? STACKS_MAINNET
  : STACKS_TESTNET;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
  ? 'SPVQ61FEWR6M4HVAT3BNE07D4BNW6A1C2ACCNQ6F'
  : 'STVQ61FEWR6M4HVAT3BNE07D4BNW6A1C2BKDND68';

export const CONTRACTS = {
  CREATOR_REGISTRY: `${CONTRACT_ADDRESS}.creator-registry`,
  SUBSCRIPTION_MANAGER: `${CONTRACT_ADDRESS}.subscription-manager`,
  MICROPAYMENT_GATEWAY: `${CONTRACT_ADDRESS}.micropayment-gateway`,
} as const;

// Fee constants (in microSTX)
export const FEES = {
  REGISTRATION: 5_000_000, // 5 STX
  PROFILE_UPDATE: 500_000, // 0.5 STX
  VERIFICATION_STAKE: 10_000_000, // 10 STX
  TIER_UPGRADE: 2_000_000, // 2 STX
  MIN_CONTENT_PRICE: 100_000, // 0.1 STX
  MAX_CONTENT_PRICE: 10_000_000, // 10 STX
  MIN_SUBSCRIPTION_BASIC: 5_000_000, // 5 STX
  MAX_SUBSCRIPTION_VIP: 100_000_000, // 100 STX
} as const;

// Tier levels
export const SUBSCRIPTION_TIERS = {
  BASIC: { level: 1, minPrice: 5_000_000, maxPrice: 25_000_000 },
  PREMIUM: { level: 2, minPrice: 25_000_001, maxPrice: 50_000_000 },
  VIP: { level: 3, minPrice: 50_000_001, maxPrice: 100_000_000 },
} as const;

// Helper to convert microSTX to STX
export const microStxToStx = (microStx: number): number => microStx / 1_000_000;

// Helper to convert STX to microSTX
export const stxToMicroStx = (stx: number): number => Math.floor(stx * 1_000_000);
