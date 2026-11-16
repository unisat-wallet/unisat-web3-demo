import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('@unisat/wallet-connect-react', () => ({
  useWallet: () => ({
    account: undefined,
    wallet: undefined,
    isConnecting: false,
    isInitialized: true,
    connect: jest.fn(),
    disconnect: jest.fn(),
  }),
}));

test('renders the API explorer in preview mode', () => {
  render(<App />);

  expect(screen.getByText('UniSat Wallet Demo')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Sign Message' })).toBeInTheDocument();
  expect(screen.getByText('Preview mode')).toBeInTheDocument();
});
