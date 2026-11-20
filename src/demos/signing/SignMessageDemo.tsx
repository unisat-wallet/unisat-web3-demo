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
  docUrl: 'https://api-docs.unisat.io/docs/wallet-api/sign-message#signmessage',
  description: 'Sign a message using ECDSA or BIP-322 signature scheme.',
  walletConnectSupported: true,
};

export function SignMessageDemo() {
  const [message, setMessage] = useState('hello world~');
  const [signingType, setSigningType] = useState<'ecdsa' | 'bip322-simple'>();
  const { result, execute, isLoading } = useDemoExecution();
  const { signMessage, wallet } = useWallet();

  const handleSign = async (type: 'ecdsa' | 'bip322-simple') => {
    setSigningType(type);
    try {
      await execute(async () => {
        // Use wallet-connect if available, otherwise fallback to unisat
        if (wallet) {
          return signMessage(message, type);
        }
        return getUnisat().signMessage(message, type);
      }, (signature) => `${type === 'ecdsa' ? 'ECDSA' : 'BIP-322'} signature\n${String(signature)}`);
    } catch {
      // useDemoExecution has already rendered the request error.
    } finally {
      setSigningType(undefined);
    }
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
          loading={isLoading && signingType === 'ecdsa'}
          disabled={isLoading && signingType !== 'ecdsa'}
          onClick={() => void handleSign('ecdsa')}
        >
          Sign (ECDSA)
        </Button>
        <Button
          loading={isLoading && signingType === 'bip322-simple'}
          disabled={isLoading && signingType !== 'bip322-simple'}
          onClick={() => void handleSign('bip322-simple')}
        >
          Sign (BIP-322)
        </Button>
      </Space>
    </DemoCard>
  );
}
