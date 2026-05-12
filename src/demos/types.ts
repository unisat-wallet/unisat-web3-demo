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
  | 'signing'      // Message and PSBT signing
  | 'transaction'  // Sending BTC, inscriptions, runes
  | 'broadcast'    // Push tx/psbt
  | 'advanced';    // Multi-sign, batch operations

export const CATEGORY_LABELS: Record<DemoCategory, string> = {
  signing: 'Signing',
  transaction: 'Transactions',
  broadcast: 'Broadcast',
  advanced: 'Advanced',
};

export const CATEGORY_ORDER: DemoCategory[] = [
  'signing',
  'transaction',
  'broadcast',
  'advanced',
];
