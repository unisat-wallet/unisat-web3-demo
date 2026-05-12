import { useState } from 'react';
import { Button, Input } from 'antd';
import { useWallet } from '@unisat/wallet-connect-react';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution, getUnisat } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

export const signPsbtConfig: DemoConfig = {
  key: 'signPsbt',
  title: 'Sign PSBT',
  category: 'signing',
  apiMethod: 'unisat.signPsbt',
  docUrl: 'https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#signpsbt',
  description: 'Sign a Partially Signed Bitcoin Transaction (PSBT).',
  walletConnectSupported: true,
};

export function SignPsbtDemo() {
  const [psbtHex, setPsbtHex] = useState('');
  const { result, execute, isLoading } = useDemoExecution();
  const { signPsbt, wallet } = useWallet();

  const handleSign = async () => {
    if (!psbtHex.trim()) {
      throw new Error('Please enter a PSBT hex');
    }

    await execute(async () => {
      if (wallet) {
        return signPsbt(psbtHex);
      }
      return getUnisat().signPsbt(psbtHex);
    });
  };

  return (
    <DemoCard config={signPsbtConfig} result={result}>
      <DemoField label="PSBT Hex">
        <Input.TextArea
          value={psbtHex}
          onChange={(e) => setPsbtHex(e.target.value)}
          placeholder="Enter PSBT hex string"
          rows={3}
        />
      </DemoField>

      <Button
        type="primary"
        loading={isLoading}
        onClick={handleSign}
        style={{ marginTop: 16 }}
      >
        Sign PSBT
      </Button>
    </DemoCard>
  );
}
