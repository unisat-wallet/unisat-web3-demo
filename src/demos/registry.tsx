/**
 * Demo Registry
 * Central place to register all demos for easy extension
 */

import type { DemoConfig, DemoCategory } from './types';
import { CATEGORY_ORDER } from './types';

// Wallet connection and state demos
import {
  WalletAccountDemo,
  walletAccountConfig,
  WalletStateDemo,
  walletStateConfig,
  WalletEventsDemo,
  walletEventsConfig,
  MobileDappLinkDemo,
  mobileDappLinkConfig,
} from './wallet';

// Signing demos
import { SignMessageDemo, signMessageConfig } from './signing/SignMessageDemo';
import { SignPsbtDemo, signPsbtConfig } from './signing/SignPsbtDemo';
import { SignPsbtsDemo, signPsbtsConfig } from './signing/SignPsbtsDemo';

// Transaction demos
import { SendBitcoinDemo, sendBitcoinConfig } from './transaction/SendBitcoinDemo';
import { SendInscriptionDemo, sendInscriptionConfig } from './transaction/SendInscriptionDemo';
import { SendRunesDemo, sendRunesConfig } from './transaction/SendRunesDemo';
import { InscribeTransferDemo, inscribeTransferConfig } from './transaction/InscribeTransferDemo';

// RGB demos
import { RgbAssetsDemo, rgbAssetsConfig } from './rgb/RgbAssetsDemo';
import { RgbIssueDemo, rgbIssueConfig } from './rgb/RgbIssueDemo';
import { RgbReceiveDemo, rgbReceiveConfig } from './rgb/RgbReceiveDemo';
import { RgbPaymentDemo, rgbPaymentConfig } from './rgb/RgbPaymentDemo';
import { RgbSellSwapDemo, rgbSellSwapConfig } from './rgb/RgbSellSwapDemo';
import { RgbBuySwapDemo, rgbBuySwapConfig } from './rgb/RgbBuySwapDemo';

// WebRGB v1 demos
import {
  WebRgbConnectionDemo,
  webRgbConnectionConfig,
  WebRgbAssetsDemo,
  webRgbAssetsConfig,
  WebRgbReceiveDemo,
  webRgbReceiveConfig,
  WebRgbSendDemo,
  webRgbSendConfig,
  WebRgbTransfersDemo,
  webRgbTransfersConfig,
  WebRgbEventsDemo,
  webRgbEventsConfig,
} from './webrgb';

import {
  BitcoinWalletConnectDemo,
  bitcoinWalletConnectConfig,
  RgbWalletConnectDemo,
  rgbWalletConnectConfig,
} from './walletconnect';

// Broadcast demos
import { PushPsbtDemo, pushPsbtConfig } from './broadcast/PushPsbtDemo';
import { PushTxDemo, pushTxConfig } from './broadcast/PushTxDemo';

// Advanced demos
import { MultiSignMessageDemo, multiSignMessageConfig } from './advanced/MultiSignMessageDemo';
import { DeriveContextHashDemo, deriveContextHashConfig } from './advanced/DeriveContextHashDemo';

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
  // Wallet
  { config: walletAccountConfig, component: WalletAccountDemo },
  { config: walletStateConfig, component: WalletStateDemo },
  { config: walletEventsConfig, component: WalletEventsDemo },
  { config: mobileDappLinkConfig, component: MobileDappLinkDemo },

  // Signing
  { config: signMessageConfig, component: SignMessageDemo },
  { config: signPsbtConfig, component: SignPsbtDemo },
  { config: signPsbtsConfig, component: SignPsbtsDemo },

  // Transactions
  { config: sendBitcoinConfig, component: SendBitcoinDemo },
  { config: sendInscriptionConfig, component: SendInscriptionDemo },
  { config: sendRunesConfig, component: SendRunesDemo },
  { config: inscribeTransferConfig, component: InscribeTransferDemo },

  // RGB
  { config: rgbAssetsConfig, component: RgbAssetsDemo },
  { config: rgbIssueConfig, component: RgbIssueDemo },
  { config: rgbReceiveConfig, component: RgbReceiveDemo },
  { config: rgbPaymentConfig, component: RgbPaymentDemo },
  { config: rgbSellSwapConfig, component: RgbSellSwapDemo },
  { config: rgbBuySwapConfig, component: RgbBuySwapDemo },

  // WebRGB v1
  { config: webRgbConnectionConfig, component: WebRgbConnectionDemo },
  { config: webRgbAssetsConfig, component: WebRgbAssetsDemo },
  { config: webRgbReceiveConfig, component: WebRgbReceiveDemo },
  { config: webRgbSendConfig, component: WebRgbSendDemo },
  { config: webRgbTransfersConfig, component: WebRgbTransfersDemo },
  { config: webRgbEventsConfig, component: WebRgbEventsDemo },

  // WalletConnect v2
  { config: bitcoinWalletConnectConfig, component: BitcoinWalletConnectDemo },
  { config: rgbWalletConnectConfig, component: RgbWalletConnectDemo },

  // Broadcast
  { config: pushPsbtConfig, component: PushPsbtDemo },
  { config: pushTxConfig, component: PushTxDemo },

  // Advanced
  { config: multiSignMessageConfig, component: MultiSignMessageDemo },
  { config: deriveContextHashConfig, component: DeriveContextHashDemo },
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
