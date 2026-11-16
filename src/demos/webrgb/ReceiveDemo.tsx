import { useState } from 'react';
import { Alert, Button, Input, InputNumber, Select } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';
import { requireWebRgb, useWebRgbProvider } from './provider';

export const webRgbReceiveConfig: DemoConfig = {
  key: 'webRgbReceive',
  title: 'Receive',
  category: 'webrgb',
  apiMethod: 'rgb.blindReceive / witnessReceive',
  description: 'Create a blind or witness WebRGB receive invoice.',
};

export function WebRgbReceiveDemo() {
  const [recipientType, setRecipientType] = useState<'blind' | 'witness'>('blind');
  const [assetId, setAssetId] = useState('');
  const [amount, setAmount] = useState<number>();
  const [durationSeconds, setDurationSeconds] = useState(900);
  const [minConfirmations, setMinConfirmations] = useState(3);
  const { provider, enabled } = useWebRgbProvider();
  const { result, execute, isLoading } = useDemoExecution();

  const receive = async () => {
    try {
      await execute(async () => {
        const rgb = requireWebRgb(provider);
        const args = {
          ...(assetId.trim() ? { assetId: assetId.trim() } : {}),
          ...(amount === undefined ? {} : { amount }),
          durationSeconds,
          minConfirmations,
        };
        return recipientType === 'blind' ? rgb.blindReceive(args) : rgb.witnessReceive(args);
      }, (data) => JSON.stringify(data, null, 2));
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  return (
    <DemoCard config={webRgbReceiveConfig} result={result}>
      <Alert type="info" showIcon message="WebRGB amount type" description="WebRGB receive amounts are positive JavaScript safe integers. An amount requires a known asset ID." />
      {!enabled && <Alert className="rgb-inline-alert" type="warning" showIcon message="Enable WebRGB in Provider & Connection first" />}
      <DemoField label="Receive parameters">
        <div className="rgb-form-grid">
          <label>Recipient type<Select value={recipientType} onChange={setRecipientType} options={[{ value: 'blind', label: 'Blind' }, { value: 'witness', label: 'Witness' }]} /></label>
          <label>Asset ID <em>optional</em><Input value={assetId} onChange={(event) => setAssetId(event.target.value)} /></label>
          <label>Amount <em>optional safe integer</em><InputNumber min={1} precision={0} value={amount} onChange={(value) => setAmount(value ?? undefined)} /></label>
          <label>Expires in seconds<InputNumber min={1} precision={0} value={durationSeconds} onChange={(value) => setDurationSeconds(value ?? 900)} /></label>
          <label>Minimum confirmations<InputNumber min={0} precision={0} value={minConfirmations} onChange={(value) => setMinConfirmations(value ?? 3)} /></label>
        </div>
        <Button type="primary" loading={isLoading} disabled={!enabled} onClick={() => void receive()}>Create {recipientType} invoice</Button>
      </DemoField>
    </DemoCard>
  );
}
