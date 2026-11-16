import { useState } from 'react';
import { Alert, Button, Input, InputNumber, Select, Space, Table, Tag } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { getUnisat, useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

type RgbReceive = {
  recipientId?: string;
  invoice: string;
  assetId?: string;
  amount?: string;
  status?: string;
  expirationTimestamp?: number;
};

export const rgbReceiveConfig: DemoConfig = {
  key: 'rgbReceive',
  title: 'RGB Receive',
  category: 'rgb',
  apiMethod: 'unisat.rgb.createReceiveInvoice / getPendingReceives / acceptReceive / rejectReceive',
  description: 'Create a blind RGB receive invoice, then inspect and accept or reject incoming consignments.',
};

export function RgbReceiveDemo() {
  const [assetId, setAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const [durationSeconds, setDurationSeconds] = useState<number>(900);
  const [minConfirmations, setMinConfirmations] = useState<number>(3);
  const [recipientType, setRecipientType] = useState<'blind' | 'witness'>('blind');
  const [createdInvoice, setCreatedInvoice] = useState('');
  const [receives, setReceives] = useState<RgbReceive[]>([]);
  const { result, execute, isLoading } = useDemoExecution();

  const refreshReceives = async () => {
    try {
      await execute(async () => {
        const response = await getUnisat().rgb.getPendingReceives();
        setReceives(response?.list || []);
        return response;
      }, (data) => JSON.stringify(data, null, 2));
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const createInvoice = async () => {
    try {
      const response = await execute(async () => {
        if (durationSeconds < 1) throw new Error('Invoice expiry must be at least one second');
        return getUnisat().rgb.createReceiveInvoice({
          ...(assetId.trim() ? { assetId: assetId.trim() } : {}),
          ...(amount.trim() ? { amount: amount.trim() } : {}),
          durationSeconds,
          recipientType,
          minConfirmations,
        });
      }, (data) => JSON.stringify(data, null, 2));
      if (response?.invoice) setCreatedInvoice(response.invoice);
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const respondToReceive = async (receive: RgbReceive, accepted: boolean) => {
    if (!receive.recipientId) return;
    try {
      await execute(
        () => accepted
          ? getUnisat().rgb.acceptReceive(receive.recipientId!)
          : getUnisat().rgb.rejectReceive(receive.recipientId!),
        (data) => JSON.stringify(data, null, 2),
      );
      const latest = await getUnisat().rgb.getPendingReceives();
      setReceives(latest?.list || []);
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  return (
    <DemoCard config={rgbReceiveConfig} result={result}>
      <Alert
        type="warning"
        showIcon
        message="Experimental — receipt lifecycle"
        description="Create an invoice first. A received consignment becomes actionable only when its status is PendingAccept. Accept and reject both require wallet confirmation."
      />
      <DemoField label="1. Create a receive invoice">
        <div className="rgb-form-grid">
          <label>Asset ID <em>optional — blank accepts any asset</em><Input value={assetId} onChange={(event) => setAssetId(event.target.value)} placeholder="RGB contract ID" /></label>
          <label>Amount <em>optional — blank accepts any amount</em><Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Atomic units" /></label>
          <label>Expires in seconds<InputNumber value={durationSeconds} min={1} precision={0} onChange={(value) => setDurationSeconds(value || 1)} /></label>
          <label>Minimum confirmations<InputNumber value={minConfirmations} min={1} precision={0} onChange={(value) => setMinConfirmations(value ?? 3)} /></label>
          <label>Recipient type<Select value={recipientType} onChange={setRecipientType} options={[{ value: 'blind', label: 'Blind (default)' }, { value: 'witness', label: 'Witness' }]} /></label>
        </div>
        <Button type="primary" loading={isLoading} onClick={() => void createInvoice()}>Create receive invoice</Button>
      </DemoField>
      {createdInvoice && (
        <DemoField label="Created RGB invoice">
          <Input.TextArea value={createdInvoice} readOnly rows={4} />
        </DemoField>
      )}
      <DemoField label="2. Pending receives">
        <div className="rgb-section-actions"><span>Read-only query. Refresh after a sender submits a transfer.</span><Button loading={isLoading} onClick={() => void refreshReceives()}>Refresh pending receives</Button></div>
        <Table
          size="small"
          rowKey={(item) => item.recipientId || item.invoice}
          pagination={false}
          locale={{ emptyText: 'No pending invoices or receives loaded.' }}
          dataSource={receives}
          columns={[
            { title: 'Asset ID', dataIndex: 'assetId', ellipsis: true, render: (value: string | undefined) => value || 'Any asset' },
            { title: 'Amount', dataIndex: 'amount', render: (value: string | undefined) => value || 'Any amount' },
            { title: 'Status', dataIndex: 'status', render: (status: string | undefined) => <Tag color={status === 'PendingAccept' ? 'gold' : 'default'}>{status || 'Unknown'}</Tag> },
            {
              title: 'Action',
              render: (_: unknown, receive: RgbReceive) => receive.status === 'PendingAccept' && receive.recipientId ? (
                <Space size={4}>
                  <Button size="small" type="primary" loading={isLoading} onClick={() => void respondToReceive(receive, true)}>Accept</Button>
                  <Button size="small" danger loading={isLoading} onClick={() => void respondToReceive(receive, false)}>Reject</Button>
                </Space>
              ) : 'Awaiting sender',
            },
          ]}
        />
      </DemoField>
    </DemoCard>
  );
}
