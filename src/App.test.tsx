import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

vi.mock('@unisat/wallet-connect-react', () => ({
  useWallet: () => ({
    account: undefined,
    wallet: undefined,
    isConnecting: false,
    isInitialized: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

test('renders the API explorer in preview mode', () => {
  render(<App />);

  expect(screen.getByText('UniSat Wallet Integration Demo')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Account & Connection' })).toBeInTheDocument();
  expect(screen.getByText('Preview mode')).toBeInTheDocument();
});

test('renders wallet read APIs as a dedicated menu group', () => {
  render(<App />);

  expect(screen.getByRole('button', { name: 'Open Wallet APIs' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Account & Connection/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Wallet State/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Wallet Events/ })).toBeInTheDocument();
});

test('groups UniSat Mobile entry points together after wallet APIs', () => {
  render(<App />);

  const walletGroup = screen.getByRole('button', { name: 'Open Wallet APIs' });
  const mobileGroup = screen.getByRole('button', { name: 'Open Mobile Integration APIs' });

  expect(walletGroup.compareDocumentPosition(mobileGroup) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.getByRole('button', { name: /Open dApp in UniSat Mobile/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /WalletConnect — Bitcoin/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /WalletConnect — RGB/ })).toBeInTheDocument();
});

test('renders WebRGB as its own grouped API menu', () => {
  render(<App />);

  expect(screen.getByRole('button', { name: 'Open WebRGB APIs' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Provider & Connection/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Assets/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Receive/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Invoice & Send/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Transfers/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Transfer Events/ })).toBeInTheDocument();
});

test('scrolls the workspace to the top when selecting another API', () => {
  const scrollTo = vi.fn();
  const originalScrollTo = HTMLElement.prototype.scrollTo;
  HTMLElement.prototype.scrollTo = scrollTo;

  render(<App />);
  scrollTo.mockClear();
  fireEvent.click(screen.getByRole('button', { name: /^Assets/ }));

  expect(screen.getByRole('heading', { name: 'Assets' })).toBeInTheDocument();
  expect(scrollTo).toHaveBeenCalledWith({ top: 0 });

  HTMLElement.prototype.scrollTo = originalScrollTo;
});
