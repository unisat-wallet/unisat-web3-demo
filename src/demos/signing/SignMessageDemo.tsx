import { useState } from 'react';
import { Button, Input, Space } from 'antd';
import { useWallet } from '@unisat/wallet-connect-react';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution, getUnisat } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

export const signMessageConfig: DemoConfig = {
  key: 'signMessage',
  title: 'Sign Message',
  category: 'signing',
  apiMethod: 'unisat.signMessage',
  docUrl: 'https://github.com/unisat-wallet/wallet/blob/master/docs/api/sign-message.md#signmessage',
  description: 'Sign a message using ECDSA or BIP-322 signature scheme.',
  walletConnectSupported: true,
};

export function SignMessageDemo() {
  const [message, setMessage] = useState('hello world~');
  const { result, execute, isLoading } = useDemoExecution();
  const { signMessage, wallet } = useWallet();

  const handleSign = async (type: 'ecdsa' | 'bip322-simple') => {
    await execute(async () => {
      // Use wallet-connect if available, otherwise fallback to unisat
      if (wallet) {
        return signMessage(message, type);
      }
      return getUnisat().signMessage(message, type);
    });
  };

  return (
    <DemoCard config={signMessageConfig} result={result}>
      <DemoField label="Message">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message to sign"
        />
      </DemoField>

      <Space style={{ marginTop: 16 }}>
        <Button
          type="primary"
          loading={isLoading}
          onClick={() => handleSign('ecdsa')}
        >
          Sign (ECDSA)
        </Button>
        <Button
          loading={isLoading}
          onClick={() => handleSign('bip322-simple')}
        >
          Sign (BIP-322)
        </Button>
      </Space>
    </DemoCard>
  );
}
