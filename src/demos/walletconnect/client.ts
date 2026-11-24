import { SignClient } from '@walletconnect/sign-client';
import { DEFAULT_WALLETCONNECT_PROJECT_ID } from './protocol';

let clientPromise: ReturnType<typeof SignClient.init> | undefined;

export function walletConnectProjectId() {
  return import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() ||
    DEFAULT_WALLETCONNECT_PROJECT_ID;
}

export function getWalletConnectClient() {
  if (!clientPromise) {
    const origin = window.location.origin;
    clientPromise = SignClient.init({
      projectId: walletConnectProjectId(),
      metadata: {
        name: 'UniSat Web3 Demo',
        description: 'UniSat WalletConnect interoperability test dApp',
        url: origin,
        icons: [`${origin}${import.meta.env.BASE_URL}logo192.png`],
      },
    });
  }
  return clientPromise;
}
