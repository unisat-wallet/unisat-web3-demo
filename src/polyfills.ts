import { Buffer } from 'buffer';

// bitcoinjs-lib 6 expects Node's Buffer global. Webpack 5 (used by
// react-scripts 5) no longer provides it for browser bundles.
if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}
