import { useState } from 'react';
import { Alert, Button, Input, Space } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';
import { requireWebRgb, useWebRgbProvider } from './provider';

export const webRgbAssetsConfig: DemoConfig = {
  key: 'webRgbAssets',
  title: 'Assets',
  category: 'webrgb',
  apiMethod: 'rgb.listAssets / getAssetBalance',
  docUrl: 'https://api-docs.unisat.io/docs/wallet-api/webrgb#assets',
  description: 'List WebRGB assets or query one asset balance by contract ID.',
};

export function WebRgbAssetsDemo() {
  const [assetId, setAssetId] = useState('');
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
    <DemoCard config={webRgbAssetsConfig} result={result}>
      {!enabled && <Alert type="warning" showIcon message="Enable WebRGB in Provider & Connection first" />}
      <DemoField label="Asset interfaces">
        <Input value={assetId} onChange={(event) => setAssetId(event.target.value)} placeholder="Asset ID for balance query" />
        <Space wrap className="rgb-payment-actions">
          <Button type="primary" loading={isLoading} disabled={!enabled} onClick={() => void run(() => requireWebRgb(provider).listAssets())}>List assets</Button>
          <Button loading={isLoading} disabled={!enabled || !assetId.trim()} onClick={() => void run(() => requireWebRgb(provider).getAssetBalance(assetId.trim()))}>Get asset balance</Button>
        </Space>
      </DemoField>
    </DemoCard>
  );
}
