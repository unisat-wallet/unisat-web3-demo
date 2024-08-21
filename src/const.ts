export enum ChainType {
  BITCOIN_MAINNET = "BITCOIN_MAINNET",
  BITCOIN_TESTNET = "BITCOIN_TESTNET",
  BITCOIN_TESTNET4 = "BITCOIN_TESTNET4",
  BITCOIN_SIGNET = "BITCOIN_SIGNET",
  FRACTAL_BITCOIN_MAINNET = "FRACTAL_BITCOIN_MAINNET",
  FRACTAL_BITCOIN_TESTNET = "FRACTAL_BITCOIN_TESTNET",
}

export enum NetworkType {
  MAINNET,
  TESTNET,
}

type TypeChain = {
  enum: ChainType;
  label: string;
  icon: string;
  unit: string;
  networkType: NetworkType;
  endpoints: string[];
  mempoolSpaceUrl: string;
  unisatUrl: string;
  ordinalsUrl: string;
};

export const CHAINS_MAP: { [key: string]: TypeChain } = {
  [ChainType.BITCOIN_MAINNET]: {
    enum: ChainType.BITCOIN_MAINNET,
    label: "Bitcoin Mainnet",
    icon: "./images/artifacts/bitcoin-mainnet.png",
    unit: "BTC",
    networkType: NetworkType.MAINNET,
    endpoints: ["https://wallet-api.unisat.io"],
    mempoolSpaceUrl: "https://mempool.space",
    unisatUrl: "https://unisat.io",
    ordinalsUrl: "https://ordinals.com",
  },
  [ChainType.BITCOIN_TESTNET]: {
    enum: ChainType.BITCOIN_TESTNET,
    label: "Bitcoin Testnet",
    icon: "./images/artifacts/bitcoin-testnet.svg",
    unit: "tBTC",
    networkType: NetworkType.TESTNET,
    endpoints: ["https://wallet-api-testnet.unisat.io"],
    mempoolSpaceUrl: "https://mempool.space/testnet",
    unisatUrl: "https://testnet.unisat.io",
    ordinalsUrl: "https://testnet.ordinals.com",
  },
  [ChainType.BITCOIN_TESTNET4]: {
    enum: ChainType.BITCOIN_TESTNET4,
    label: "Bitcoin Testnet4 (Beta)",
    icon: "./images/artifacts/bitcoin-testnet.svg",
    unit: "tBTC",
    networkType: NetworkType.TESTNET,
    endpoints: ["https://wallet-api-testnet4.unisat.io"],
    mempoolSpaceUrl: "https://mempool.space/testnet4",
    unisatUrl: "https://testnet4.unisat.io",
    ordinalsUrl: "https://testnet4.ordinals.com",
  },
  [ChainType.BITCOIN_SIGNET]: {
    enum: ChainType.BITCOIN_SIGNET,
    label: "Bitcoin Signet",
    icon: "./images/artifacts/bitcoin-signet.svg",
    unit: "sBTC",
    networkType: NetworkType.TESTNET,
    endpoints: ["https://wallet-api-signet.unisat.io"],
    mempoolSpaceUrl: "https://mempool.space/signet",
    unisatUrl: "https://signet.unisat.io",
    ordinalsUrl: "https://signet.ordinals.com",
  },
  [ChainType.FRACTAL_BITCOIN_MAINNET]: {
    enum: ChainType.FRACTAL_BITCOIN_MAINNET,
    label: "Fractal Bitcoin Mainnet",
    icon: "./images/artifacts/fractalbitcoin-mainnet.png",
    unit: "FB",
    networkType: NetworkType.MAINNET,
    endpoints: ["https://wallet-api-fractal.unisat.io"],
    mempoolSpaceUrl: "https://mempool.fractalbitcoin.io",
    unisatUrl: "https://fractal.unisat.io",
    ordinalsUrl: "https://ordinals.fractalbitcoin.io",
  },
  [ChainType.FRACTAL_BITCOIN_TESTNET]: {
    enum: ChainType.FRACTAL_BITCOIN_TESTNET,
    label: "Fractal Bitcoin Testnet",
    icon: "./images/artifacts/fractalbitcoin-mainnet.png",
    unit: "tFB",
    networkType: NetworkType.MAINNET,
    endpoints: ["https://wallet-api-fractal.unisat.io/testnet"],
    mempoolSpaceUrl: "https://mempool-testnet.fractalbitcoin.io",
    unisatUrl: "https://fractal-testnet.unisat.io",
    ordinalsUrl: "https://ordinals-testnet.fractalbitcoin.io",
  },
};
