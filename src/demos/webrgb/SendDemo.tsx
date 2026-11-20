import { useState } from 'react';
import { Alert, Button, Input, InputNumber, Space } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';
import { requireWebRgb, useWebRgbProvider } from './provider';

export const webRgbSendConfig: DemoConfig = {
  key: 'webRgbSend',
  title: 'Invoice & Send',
  category: 'webrgb',
  apiMethod: 'rgb.decodeRgbInvoice / sendAsset',
  docUrl: 'https://api-docs.unisat.io/docs/wallet-api/webrgb#send',
  description: 'Decode an RGB invoice, then prepare, approve and send its asset transfer.',
};

export function WebRgbSendDemo() {
  const [invoice, setInvoice] = useState('');
  const [assetId, setAssetId] = useState('');
  const [amount, setAmount] = useState<number>();
  const [feeRate, setFeeRate] = useState<number>();
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
    <DemoCard config={webRgbSendConfig} result={result}>
      <Alert type="warning" showIcon message="sendAsset owns the complete wallet lifecycle" description="The provider validates the invoice, prepares and locks the payment, asks for approval, delivers the consignment and broadcasts after ACK." />
      {!enabled && <Alert className="rgb-inline-alert" type="warning" showIcon message="Enable WebRGB in Provider & Connection first" />}
      <DemoField label="Invoice and payment">
        <div className="rgb-form-grid">
          <label>RGB invoice<Input.TextArea rows={4} value={invoice} onChange={(event) => setInvoice(event.target.value)} /></label>
          <label>Asset ID <em>required for any-asset invoice</em><Input value={assetId} onChange={(event) => setAssetId(event.target.value)} /></label>
          <label>Amount <em>required for any-amount invoice</em><InputNumber min={1} precision={0} value={amount} onChange={(value) => setAmount(value ?? undefined)} /></label>
          <label>Fee rate <em>optional sats/vB</em><InputNumber min={1} value={feeRate} onChange={(value) => setFeeRate(value ?? undefined)} /></label>
        </div>
        <Space wrap className="rgb-payment-actions">
          <Button loading={isLoading} disabled={!enabled || !invoice.trim()} onClick={() => void run(() => requireWebRgb(provider).decodeRgbInvoice(invoice.trim()))}>Decode invoice</Button>
          <Button type="primary" loading={isLoading} disabled={!enabled || !invoice.trim()} onClick={() => void run(() => requireWebRgb(provider).sendAsset({
            invoice: invoice.trim(),
            ...(assetId.trim() ? { assetId: assetId.trim() } : {}),
            ...(amount === undefined ? {} : { amount }),
            ...(feeRate === undefined ? {} : { feeRate }),
          }))}>Send asset</Button>
        </Space>
      </DemoField>
    </DemoCard>
  );
}
