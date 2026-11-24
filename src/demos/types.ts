/**
 * Demo card configuration and types
 */

export interface DemoResult {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: string;
  error?: string;
}

export interface DemoConfig {
  /** Unique key for the demo */
  key: string;
  /** Display title */
  title: string;
  /** Category for grouping */
  category: DemoCategory;
  /** Documentation URL */
  docUrl?: string;
  /** Brief description */
  description?: string;
  /** API method name (e.g., "unisat.signMessage") */
  apiMethod?: string;
  /** Whether this demo requires wallet-connect (vs unisat-specific) */
  walletConnectSupported?: boolean;
}

export type DemoCategory =
  | 'wallet'       // Connection, account and wallet state
  | 'signing'      // Message and PSBT signing
  | 'transaction'  // Sending BTC, inscriptions, runes
  | 'rgb'          // RGB assets, invoices and payments
  | 'webrgb'       // Wallet-neutral WebRGB v1 provider
  | 'walletconnect' // Remote standard Bitcoin and RGB sessions
  | 'broadcast'    // Push tx/psbt
  | 'advanced';    // Multi-sign, batch operations

export const CATEGORY_LABELS: Record<DemoCategory, string> = {
  wallet: 'Wallet',
  signing: 'Signing',
  transaction: 'Transactions',
  rgb: 'RGB',
  webrgb: 'WebRGB',
  walletconnect: 'WalletConnect',
  broadcast: 'Broadcast',
  advanced: 'Advanced',
};

export const CATEGORY_ORDER: DemoCategory[] = [
  'wallet',
  'signing',
  'transaction',
  'rgb',
  'webrgb',
  'walletconnect',
  'broadcast',
  'advanced',
];
