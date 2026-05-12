import React from 'react';
import { Modal, Button, Spin } from 'antd';
import type { WalletModalProps } from '@unisat/wallet-connect-react';
import type { BaseWallet } from '@unisat/wallet-connect';

export function SelectWalletModal({
  visible,
  onClose,
  wallets,
  connectingWallet,
  isInitialized,
  onSelectWallet,
  onCancel,
}: WalletModalProps) {
  return (
    <Modal
      title="Connect Wallet"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
    >
      {!isInitialized ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
          <p>Initializing wallets...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {wallets.map((wallet: BaseWallet) => {
            const isConnecting = connectingWallet?.config.type === wallet.config.type;
            return (
              <Button
                key={wallet.config.type}
                size="large"
                block
                loading={isConnecting}
                disabled={!wallet.installed && !isConnecting}
                onClick={() => {
                  if (isConnecting) {
                    onCancel();
                  } else {
                    onSelectWallet(wallet);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  height: 56,
                  opacity: wallet.installed ? 1 : 0.5,
                }}
              >
                <img
                  src={wallet.config.icon}
                  alt={wallet.config.name}
                  style={{
                    width: 32,
                    height: 32,
                    marginRight: 12,
                    padding: wallet.config.logoPadding || 0,
                  }}
                />
                <span>
                  {wallet.config.name}
                  {!wallet.installed && ' (Not Installed)'}
                </span>
              </Button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
