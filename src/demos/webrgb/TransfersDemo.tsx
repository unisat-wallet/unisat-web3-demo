import { useState } from 'react';
import { Alert, Button, Input, Space } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';
import { requireWebRgb, useWebRgbProvider } from './provider';

export const webRgbTransfersConfig: DemoConfig = {
  key: 'webRgbTransfers',
  title: 'Transfers',
  category: 'webrgb',
  apiMethod: 'rgb.listTransfers / getTransferStatus',
  description: 'List WebRGB transfers and inspect a specific transfer status.',
};

export function WebRgbTransfersDemo() {
  const [assetId, setAssetId] = useState('');
  const [transferId, setTransferId] = useState('');
  const { provider, enabled } = useWebRgbProvider();
  const { result, execute, isLoading } = useDemoExecution();

  const run = async (operation: () => Promise<any>) => {
    try {
      await execute(operation, (data) => JSON.stringify(data, null, 2));
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  return (
    <DemoCard config={webRgbTransfersConfig} result={result}>
      {!enabled && <Alert type="warning" showIcon message="Enable WebRGB in Provider & Connection first" />}
      <DemoField label="Transfer query">
        <div className="rgb-form-grid">
          <label>Asset ID <em>optional filter</em><Input value={assetId} onChange={(event) => setAssetId(event.target.value)} /></label>
          <label>Transfer ID<Input value={transferId} onChange={(event) => setTransferId(event.target.value)} /></label>
        </div>
        <Space wrap className="rgb-payment-actions">
          <Button type="primary" loading={isLoading} disabled={!enabled} onClick={() => void run(() => requireWebRgb(provider).listTransfers(assetId.trim() || undefined))}>List transfers</Button>
          <Button loading={isLoading} disabled={!enabled || !transferId.trim()} onClick={() => void run(() => requireWebRgb(provider).getTransferStatus(transferId.trim(), assetId.trim() || undefined))}>Get transfer status</Button>
        </Space>
      </DemoField>
    </DemoCard>
  );
}
