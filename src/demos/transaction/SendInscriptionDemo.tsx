import { useState } from 'react';
import { Button, Input } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution, getUnisat } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

export const sendInscriptionConfig: DemoConfig = {
  key: 'sendInscription',
  title: 'Send Inscription',
  category: 'transaction',
  apiMethod: 'unisat.sendInscription',
  docUrl: 'https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#sendinscription',
  description: 'Transfer an inscription to another address.',
  walletConnectSupported: false,
};

export function SendInscriptionDemo() {
  const [toAddress, setToAddress] = useState('');
  const [inscriptionId, setInscriptionId] = useState('');
  const { result, execute, isLoading } = useDemoExecution();

  const handleSend = async () => {
    if (!toAddress.trim()) {
      throw new Error('Please enter a receiver address');
    }
    if (!inscriptionId.trim()) {
      throw new Error('Please enter an inscription ID');
    }

    await execute(async () => {
      return getUnisat().sendInscription(toAddress, inscriptionId);
    });
  };

  return (
    <DemoCard config={sendInscriptionConfig} result={result}>
      <DemoField label="Receiver Address">
        <Input
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="Enter Bitcoin address"
        />
      </DemoField>

      <DemoField label="Inscription ID">
        <Input
          value={inscriptionId}
          onChange={(e) => setInscriptionId(e.target.value)}
          placeholder="Enter inscription ID"
        />
      </DemoField>

      <Button
        type="primary"
        loading={isLoading}
        onClick={handleSend}
        style={{ marginTop: 16 }}
      >
        Send Inscription
      </Button>
    </DemoCard>
  );
}
