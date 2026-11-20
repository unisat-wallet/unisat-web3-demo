import { useState } from 'react';
import { Alert, Button, Input, InputNumber, Space, Tag } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { getUnisat, useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

type IssueAvailability = {
  available?: boolean;
  availableAllocationCount?: number;
  freeAllocationCount?: number;
  colorableUtxoCount?: number;
  pendingConfirmation?: boolean;
  pendingAllocationCount?: number;
};

export const rgbIssueConfig: DemoConfig = {
  key: 'rgbIssue',
  title: 'Issue RGB20',
  category: 'rgb',
  apiMethod: 'unisat.rgb.getIssueAvailability / issueNia',
  docUrl: 'https://api-docs.unisat.io/docs/wallet-api/rgb#issue-an-nia-asset',
  description: 'Inspect RGB allocation capacity and issue an NIA asset from a wallet-API issuance order.',
};

export function RgbIssueDemo() {
  const [availability, setAvailability] = useState<IssueAvailability>();
  const [orderId, setOrderId] = useState('');
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [precision, setPrecision] = useState(0);
  const [amount, setAmount] = useState('');
  const [paymentTxid, setPaymentTxid] = useState('');
  const { result, execute, isLoading } = useDemoExecution();

  const inspectAvailability = async () => {
    try {
      const response = await execute<IssueAvailability>(
        () => getUnisat().rgb.getIssueAvailability(),
        (data) => JSON.stringify(data, null, 2),
      );
      setAvailability(response);
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const issue = async () => {
    try {
      await execute(async () => {
        if (!/^\d{6}-RGB20-[A-Z0-9]{8}$/.test(orderId.trim())) {
          throw new Error('Order ID must match 000000-RGB20-XXXXXXXX');
        }
        if (!ticker.trim() || !name.trim()) throw new Error('Ticker and name are required');
        if (!/^[1-9][0-9]*$/.test(amount.trim())) throw new Error('Amount must be a positive integer in atomic units');
        if (paymentTxid.trim() && !/^[0-9a-fA-F]{64}$/.test(paymentTxid.trim())) throw new Error('Payment txid must be 32-byte hex');
        return getUnisat().rgb.issueNia({
          orderId: orderId.trim(),
          ticker: ticker.trim(),
          name: name.trim(),
          precision,
          amount: amount.trim(),
          ...(paymentTxid.trim() ? { paymentTxid: paymentTxid.trim() } : {}),
        });
      }, (data) => JSON.stringify(data, null, 2));
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  return (
    <DemoCard config={rgbIssueConfig} result={result}>
      <Alert type="warning" showIcon message="A verified issuance order is required" description="Create the order with the wallet API first. Its network, wallet address, ticker, name, precision and amount must exactly match this request. The wallet can fund and pay a pending order in the same approval." />
      <DemoField label="1. Check wallet allocation capacity">
        <Space wrap>
          <Button loading={isLoading} onClick={() => void inspectAvailability()}>Check availability</Button>
          {availability && <Tag color={availability.available ? 'green' : 'gold'}>{availability.available ? 'Ready' : 'Allocation required'}</Tag>}
        </Space>
        {availability && (
          <div className="rgb-payment-status">
            <dl>
              <div><dt>Available allocations</dt><dd>{availability.availableAllocationCount ?? '—'}</dd></div>
              <div><dt>Free allocations</dt><dd>{availability.freeAllocationCount ?? '—'}</dd></div>
              <div><dt>Colorable UTXOs</dt><dd>{availability.colorableUtxoCount ?? '—'}</dd></div>
              <div><dt>Pending confirmation</dt><dd>{availability.pendingConfirmation ? 'Yes' : 'No'}</dd></div>
            </dl>
          </div>
        )}
      </DemoField>
      <DemoField label="2. Issue NIA asset">
        <div className="rgb-form-grid">
          <label>Issuance order ID<Input value={orderId} onChange={(event) => setOrderId(event.target.value.toUpperCase())} placeholder="000000-RGB20-XXXXXXXX" /></label>
          <label>Ticker<Input value={ticker} onChange={(event) => setTicker(event.target.value)} /></label>
          <label>Name<Input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>Precision<InputNumber min={0} max={18} precision={0} value={precision} onChange={(value) => setPrecision(value ?? 0)} /></label>
          <label>Supply <em>atomic units</em><Input value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
          <label>Existing payment txid <em>optional retry</em><Input value={paymentTxid} onChange={(event) => setPaymentTxid(event.target.value)} /></label>
        </div>
        <Button type="primary" loading={isLoading} onClick={() => void issue()}>Review and issue RGB20</Button>
      </DemoField>
    </DemoCard>
  );
}
