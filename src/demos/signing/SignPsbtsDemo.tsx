import { useState } from 'react';
import { Button, Input } from 'antd';
import { useWallet } from '@unisat/wallet-connect-react';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution, getUnisat } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

export const signPsbtsConfig: DemoConfig = {
  key: 'signPsbts',
  title: 'Sign Multiple PSBTs',
  category: 'signing',
  apiMethod: 'unisat.signPsbts',
  docUrl: 'https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#signpsbts',
  description: 'Sign multiple PSBTs in a single request.',
  walletConnectSupported: true,
};

export function SignPsbtsDemo() {
  const [psbtsHex, setPsbtsHex] = useState('');
  const { result, execute, isLoading } = useDemoExecution();
  const { signPsbts, wallet } = useWallet();

  const handleSign = async () => {
    const psbts = psbtsHex.split('\n').filter((p) => p.trim());
    if (psbts.length === 0) {
      throw new Error('Please enter at least one PSBT hex');
    }

    await execute(
      async () => {
        if (wallet) {
          return signPsbts(psbts.map((psbt) => ({ psbt })));
        }
        return getUnisat().signPsbts(psbts);
      },
      (results) => results.join('\n\n')
    );
  };

  return (
    <DemoCard config={signPsbtsConfig} result={result}>
      <DemoField label="PSBT Hex (one per line)">
        <Input.TextArea
          value={psbtsHex}
          onChange={(e) => setPsbtsHex(e.target.value)}
          placeholder="Enter PSBT hex strings, one per line"
          rows={4}
        />
      </DemoField>

      <Button
        type="primary"
        loading={isLoading}
        onClick={handleSign}
        style={{ marginTop: 16 }}
      >
        Sign PSBTs
      </Button>
    </DemoCard>
  );
}
