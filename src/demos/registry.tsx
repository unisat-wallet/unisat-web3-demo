/**
 * Demo Registry
 * Central place to register all demos for easy extension
 */

import type { DemoConfig, DemoCategory } from './types';
import { CATEGORY_ORDER } from './types';

// Signing demos
import { SignMessageDemo, signMessageConfig } from './signing/SignMessageDemo';
import { SignPsbtDemo, signPsbtConfig } from './signing/SignPsbtDemo';
import { SignPsbtsDemo, signPsbtsConfig } from './signing/SignPsbtsDemo';

// Transaction demos
import { SendBitcoinDemo, sendBitcoinConfig } from './transaction/SendBitcoinDemo';
import { SendInscriptionDemo, sendInscriptionConfig } from './transaction/SendInscriptionDemo';
import { SendRunesDemo, sendRunesConfig } from './transaction/SendRunesDemo';
import { InscribeTransferDemo, inscribeTransferConfig } from './transaction/InscribeTransferDemo';

// Broadcast demos
import { PushPsbtDemo, pushPsbtConfig } from './broadcast/PushPsbtDemo';
import { PushTxDemo, pushTxConfig } from './broadcast/PushTxDemo';

// Advanced demos
import { MultiSignMessageDemo, multiSignMessageConfig } from './advanced/MultiSignMessageDemo';

/**
 * Demo entry with config and component
 */
export interface DemoEntry {
  config: DemoConfig;
  component: React.ComponentType;
}

/**
 * All registered demos
 * To add a new demo:
 * 1. Create the demo component in the appropriate category folder
 * 2. Export the config and component
 * 3. Add an entry here
 */
export const DEMOS: DemoEntry[] = [
  // Signing
  { config: signMessageConfig, component: SignMessageDemo },
  { config: signPsbtConfig, component: SignPsbtDemo },
  { config: signPsbtsConfig, component: SignPsbtsDemo },

  // Transactions
  { config: sendBitcoinConfig, component: SendBitcoinDemo },
  { config: sendInscriptionConfig, component: SendInscriptionDemo },
  { config: sendRunesConfig, component: SendRunesDemo },
  { config: inscribeTransferConfig, component: InscribeTransferDemo },

  // Broadcast
  { config: pushPsbtConfig, component: PushPsbtDemo },
  { config: pushTxConfig, component: PushTxDemo },

  // Advanced
  { config: multiSignMessageConfig, component: MultiSignMessageDemo },
];

/**
 * Get demos grouped by category
 */
export function getDemosByCategory(): Map<DemoCategory, DemoEntry[]> {
  const grouped = new Map<DemoCategory, DemoEntry[]>();

  // Initialize with empty arrays in order
  for (const category of CATEGORY_ORDER) {
    grouped.set(category, []);
  }

  // Group demos
  for (const demo of DEMOS) {
    const list = grouped.get(demo.config.category);
    if (list) {
      list.push(demo);
    }
  }

  return grouped;
}

/**
 * Get a specific demo by key
 */
export function getDemoByKey(key: string): DemoEntry | undefined {
  return DEMOS.find((d) => d.config.key === key);
}

/**
 * Get demos that support wallet-connect
 */
export function getWalletConnectDemos(): DemoEntry[] {
  return DEMOS.filter((d) => d.config.walletConnectSupported);
}
