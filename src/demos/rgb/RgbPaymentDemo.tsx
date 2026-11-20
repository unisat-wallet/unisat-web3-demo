import { useState } from 'react';
import { Alert, Button, Input, Space, Tag } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { getUnisat, useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

type PaymentStatus = { transferId?: string; status?: string; txid?: string; assetId?: string; amount?: string };

export const rgbPaymentConfig: DemoConfig = {
  key: 'rgbPayment',
  title: 'RGB Payment',
  category: 'rgb',
  apiMethod: 'unisat.rgb.preparePayment / signPayment / cancelPayment / getPaymentStatus',
  docUrl: 'https://api-docs.unisat.io/docs/wallet-api/rgb#normal-rgb-payment',
  description: 'Prepare an RGB payment, approve its signature, then monitor or cancel that exact transfer ID.',
};

export function RgbPaymentDemo() {
  const [invoice, setInvoice] = useState('');
  const [assetId, setAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const [feeRate, setFeeRate] = useState('');
  const [transferId, setTransferId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>();
  const { result, execute, isLoading } = useDemoExecution();

  const preparePayment = async () => {
    try {
      const response = await execute(async () => {
        if (!invoice.trim()) throw new Error('Enter an RGB invoice');
        if (!assetId.trim()) throw new Error('Enter the RGB asset ID used to pay');
        if (feeRate && Number(feeRate) <= 0) throw new Error('Fee rate must be greater than zero');
        return getUnisat().rgb.preparePayment({
          invoice: invoice.trim(),
          assetId: assetId.trim(),
          ...(amount.trim() ? { amount: amount.trim() } : {}),
          ...(feeRate ? { feeRate: Number(feeRate) } : {}),
        });
      }, (data) => JSON.stringify(data, null, 2));
      const nextTransferId = response?.id || response?.transferId;
      if (nextTransferId) {
        setTransferId(nextTransferId);
        setPaymentStatus({ transferId: nextTransferId, status: 'prepared' });
      }
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const signPayment = async () => {
    try {
      await execute(async () => {
        if (!transferId.trim()) throw new Error('Prepare a payment or enter its transfer ID first');
        return getUnisat().rgb.signPayment(transferId.trim());
      }, (data) => JSON.stringify(data, null, 2));
      await checkStatus();
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const checkStatus = async () => {
    try {
      const response = await execute(async () => {
        if (!transferId.trim()) throw new Error('Enter a transfer ID first');
        return getUnisat().rgb.getPaymentStatus(transferId.trim());
      }, (data) => JSON.stringify(data, null, 2));
      if (response) setPaymentStatus(response);
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const cancelPayment = async () => {
    try {
      await execute(async () => {
        if (!transferId.trim()) throw new Error('Enter a transfer ID first');
        return getUnisat().rgb.cancelPayment(transferId.trim());
      }, (data) => JSON.stringify(data, null, 2));
      setPaymentStatus({ transferId, status: 'canceled' });
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  return (
    <DemoCard config={rgbPaymentConfig} result={result}>
      <Alert
        type="warning"
        showIcon
        message="Experimental — one transfer, one lifecycle"
        description="Prepare creates a transfer ID for this dApp origin. Sign, status and cancel must use that same ID; signing and cancellation both require wallet approval."
      />
      <DemoField label="1. Prepare payment">
        <div className="rgb-form-grid">
          <label>RGB invoice<Input.TextArea value={invoice} onChange={(event) => setInvoice(event.target.value)} rows={3} placeholder="Paste the recipient's RGB invoice" /></label>
          <label>Asset ID<Input value={assetId} onChange={(event) => setAssetId(event.target.value)} placeholder="RGB asset used for payment" /></label>
          <label>Amount <em>optional — used for open-amount invoices</em><Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Atomic units" /></label>
          <label>Fee rate <em>optional — sats/vB</em><Input value={feeRate} onChange={(event) => setFeeRate(event.target.value)} placeholder="Wallet default" /></label>
        </div>
        <Button type="primary" loading={isLoading} onClick={() => void preparePayment()}>Prepare RGB payment</Button>
      </DemoField>
      <DemoField label="2. Sign, monitor or cancel">
        <Input value={transferId} onChange={(event) => setTransferId(event.target.value)} placeholder="Transfer ID returned by rgb.preparePayment" />
        <Space wrap className="rgb-payment-actions">
          <Button type="primary" loading={isLoading} disabled={!transferId.trim()} onClick={() => void signPayment()}>Sign & send payment</Button>
          <Button loading={isLoading} disabled={!transferId.trim()} onClick={() => void checkStatus()}>Check status</Button>
          <Button danger loading={isLoading} disabled={!transferId.trim()} onClick={() => void cancelPayment()}>Cancel prepared payment</Button>
        </Space>
      </DemoField>
      {paymentStatus && (
        <div className="rgb-payment-status">
          <div><span>Payment status</span><Tag color={paymentStatus.status === 'prepared' ? 'blue' : paymentStatus.status === 'broadcasted' ? 'green' : 'default'}>{paymentStatus.status || 'unknown'}</Tag></div>
          <dl>
            <div><dt>Transfer ID</dt><dd>{paymentStatus.transferId || transferId}</dd></div>
            {paymentStatus.txid && <div><dt>Transaction ID</dt><dd>{paymentStatus.txid}</dd></div>}
            {paymentStatus.assetId && <div><dt>Asset ID</dt><dd>{paymentStatus.assetId}</dd></div>}
            {paymentStatus.amount && <div><dt>Amount</dt><dd>{paymentStatus.amount}</dd></div>}
          </dl>
        </div>
      )}
    </DemoCard>
  );
}
