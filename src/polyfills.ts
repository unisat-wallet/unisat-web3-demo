import { Buffer } from 'buffer';

// bitcoinjs-lib 6 expects Node's Buffer global. Webpack 5 (used by
// Vite does not provide Node.js globals for browser bundles.
if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}
