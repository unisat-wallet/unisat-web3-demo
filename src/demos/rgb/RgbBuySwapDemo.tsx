import { useState } from 'react';
import { crypto as bitcoinCrypto, Psbt } from 'bitcoinjs-lib';
import { Alert, Button, Input, Space, Tag } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { getUnisat, useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

type SwapStatus = { transferId?: string; status?: string; txid?: string };

function parsePsbt(value: string) {
  const normalized = value.trim();
  if (!normalized) throw new Error('PSBT is required');
  return /^[0-9a-fA-F]+$/.test(normalized)
    ? Psbt.fromHex(normalized)
    : Psbt.fromBase64(normalized);
}

function hashPsbt(value: string) {
  return bitcoinCrypto.sha256(parsePsbt(value).toBuffer()).toString('hex');
}

export const rgbBuySwapConfig: DemoConfig = {
  key: 'rgbP2pSwap',
  title: 'RGB Swap — Pure P2P',
  category: 'rgb',
  apiMethod: 'signBuySwap (v1.8.3+) / signBuySwapCommit (v1.8.4+) / acceptBuySwap (v1.8.3+) / confirmSellSwap (v1.8.3+)',
  docUrl: 'https://api-docs.unisat.io/docs/wallet-api/rgb-swap-p2p',
  description: 'Test a non-custodial trade where two UniSat wallets sign separate partial PSBTs and the page broadcasts.',
};

export function RgbBuySwapDemo() {
  const [assetId, setAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const [btcReceiveAmount, setBtcReceiveAmount] = useState('');
  const [feeRate, setFeeRate] = useState('');
  const [maxBtcSpend, setMaxBtcSpend] = useState('');
  const [invoice, setInvoice] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [unsignedPsbt, setUnsignedPsbt] = useState('');
  const [transferId, setTransferId] = useState('');
  const [coloredPsbt, setColoredPsbt] = useState('');
  const [sellerPartialPsbt, setSellerPartialPsbt] = useState('');
  const [buyerPartialPsbt, setBuyerPartialPsbt] = useState('');
  const [buyerTxid, setBuyerTxid] = useState('');
  const [buyerSignedPsbtHash, setBuyerSignedPsbtHash] = useState('');
  const [commitment, setCommitment] = useState('');
  const [proxyTransferId, setProxyTransferId] = useState('');
  const [combinedPsbt, setCombinedPsbt] = useState('');
  const [confirmedPsbt, setConfirmedPsbt] = useState('');
  const [status, setStatus] = useState<SwapStatus>();
  const { result, execute, isLoading } = useDemoExecution();

  const createBuyerInvoice = async () => {
    try {
      const response = await execute(async () => {
        if (!assetId.trim() || !amount.trim()) throw new Error('Asset ID and amount are required');
        return getUnisat().rgb.createReceiveInvoice({
          assetId: assetId.trim(),
          amount: amount.trim(),
          purpose: 'buy_swap',
        });
      }, (data) => JSON.stringify(data, null, 2));
      if (response) {
        setInvoice(response.invoice || '');
        setRecipientId(response.recipientId || '');
      }
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const prepareSeller = async () => {
    try {
      const response = await execute(async () => {
        if (!invoice.trim() || !assetId.trim() || !amount.trim() ||
            !btcReceiveAmount.trim() || !unsignedPsbt.trim()) {
          throw new Error('Invoice, asset ID, amount, BTC receive amount and unsigned PSBT are required');
        }
        return getUnisat().rgb.prepareSwap({
          invoice: invoice.trim(),
          assetId: assetId.trim(),
          amount: amount.trim(),
          btcReceiveAmount: btcReceiveAmount.trim(),
          ...(feeRate.trim() ? { feeRate: Number(feeRate) } : {}),
          psbt: unsignedPsbt.trim(),
        });
      }, (data) => JSON.stringify(data, null, 2));
      if (response) {
        setTransferId(response.transferId || '');
        setColoredPsbt(response.coloredPsbt || '');
        setStatus(response);
      }
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const publishSeller = async () => {
    try {
      const response = await execute(async () => {
        if (!transferId.trim() || !coloredPsbt.trim()) throw new Error('Transfer ID and colored PSBT are required');
        return getUnisat().rgb.signSellSwapAndPublishConsignment(
          transferId.trim(),
          coloredPsbt.trim(),
        );
      }, (data) => JSON.stringify(data, null, 2));
      if (response) {
        setSellerPartialPsbt(response.makerSignedPsbt || '');
        setStatus(response);
      }
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const signBuyer = async () => {
    try {
      const response = await execute(async () => {
        if (!recipientId.trim() || !assetId.trim() || !amount.trim() ||
            !maxBtcSpend.trim() || !coloredPsbt.trim()) {
          throw new Error('Recipient ID, asset ID, amount, maximum BTC spend and colored PSBT are required');
        }
        return getUnisat().rgb.signBuySwap({
          recipientId: recipientId.trim(),
          assetId: assetId.trim(),
          amount: amount.trim(),
          maxBtcSpend: maxBtcSpend.trim(),
          swapPsbt: coloredPsbt.trim(),
        });
      }, (data) => JSON.stringify(data, null, 2));
      if (response) {
        const signed = response.buyerSignedPsbt || '';
        setBuyerPartialPsbt(signed);
        setBuyerTxid(response.txid || '');
        setBuyerSignedPsbtHash(signed ? hashPsbt(signed) : '');
      }
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const signSellerCommitment = async () => {
    try {
      const response = await execute(async () => {
        const psbtHash = buyerSignedPsbtHash.trim() || hashPsbt(buyerPartialPsbt);
        if (!transferId.trim() || !buyerTxid.trim()) throw new Error('Transfer ID and buyer transaction ID are required');
        return getUnisat().rgb.signBuySwapCommit(
          transferId.trim(),
          buyerTxid.trim(),
          psbtHash,
        );
      }, (data) => JSON.stringify(data, null, 2));
      if (response) {
        setBuyerSignedPsbtHash(response.buyerSignedPsbtHash || buyerSignedPsbtHash);
        setCommitment(response.commitment || '');
        setProxyTransferId(response.proxyTransferId || '');
      }
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const acceptBuyer = async () => {
    try {
      await execute(async () => {
        if (!recipientId.trim() || !commitment.trim()) throw new Error('Recipient ID and seller commitment are required');
        return getUnisat().rgb.acceptBuySwap({
          recipientId: recipientId.trim(),
          backendCommit: commitment.trim(),
        });
      }, (data) => JSON.stringify(data, null, 2));
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const combinePartials = async () => {
    try {
      await execute(async () => {
        const seller = parsePsbt(sellerPartialPsbt);
        seller.combine(parsePsbt(buyerPartialPsbt));
        const combined = seller.toHex();
        setCombinedPsbt(combined);
        return { combinedPsbt: combined };
      }, (data) => JSON.stringify(data, null, 2));
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const confirmSeller = async () => {
    try {
      const response = await execute(async () => {
        if (!transferId.trim() || !combinedPsbt.trim()) throw new Error('Transfer ID and combined PSBT are required');
        return getUnisat().rgb.confirmSellSwap(transferId.trim(), combinedPsbt.trim());
      }, (data) => JSON.stringify(data, null, 2));
      if (response) {
        setConfirmedPsbt(response.signedPsbt || combinedPsbt.trim());
        setStatus(response);
      }
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const broadcast = async () => {
    try {
      await execute(async () => {
        const psbt = parsePsbt(confirmedPsbt);
        psbt.finalizeAllInputs();
        return getUnisat().pushPsbt(psbt.toHex());
      }, (data) => JSON.stringify(data, null, 2));
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const checkStatus = async () => {
    try {
      const response = await execute(async () => {
        if (!transferId.trim()) throw new Error('Transfer ID is required');
        return getUnisat().rgb.getOperationStatus(transferId.trim());
      }, (data) => JSON.stringify(data, null, 2));
      if (response) setStatus(response);
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  return (
    <DemoCard config={rgbBuySwapConfig} result={result}>
      <Alert
        type="warning"
        showIcon
        message="Pure P2P mode — requires UniSat Wallet v1.8.4+"
        description="The buyer and seller use separate UniSat wallets. The page carries only invoices, partial PSBTs and the per-transfer commitment. Do not call syncSellSwapAck in this flow."
      />

      <DemoField label="Shared trade parameters">
        <div className="rgb-form-grid">
          <label>Asset ID<Input value={assetId} onChange={(event) => setAssetId(event.target.value)} placeholder="rgb:..." /></label>
          <label>RGB amount<Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Atomic units" /></label>
          <label>Seller minimum BTC received<Input value={btcReceiveAmount} onChange={(event) => setBtcReceiveAmount(event.target.value)} placeholder="Sats" /></label>
          <label>Buyer maximum BTC spend<Input value={maxBtcSpend} onChange={(event) => setMaxBtcSpend(event.target.value)} placeholder="Sats including fee" /></label>
          <label>Fee rate <em>optional</em><Input value={feeRate} onChange={(event) => setFeeRate(event.target.value)} placeholder="sats/vB" /></label>
        </div>
      </DemoField>

      <DemoField label="1. Buyer wallet — create the buy-swap invoice">
        <Button type="primary" loading={isLoading} onClick={() => void createBuyerInvoice()}>Create buy-swap invoice</Button>
        <div className="rgb-form-grid rgb-payment-actions">
          <label>Invoice<Input.TextArea rows={3} value={invoice} onChange={(event) => setInvoice(event.target.value)} /></label>
          <label>Recipient ID<Input value={recipientId} onChange={(event) => setRecipientId(event.target.value)} /></label>
        </div>
      </DemoField>

      <DemoField label="2. Seller wallet — prepare, sign and publish">
        <Alert type="info" showIcon message="Switch to the seller wallet" description="Provide an unsigned Opret-first swap PSBT. The colored PSBT is also the unsigned transaction the buyer signs in step 3." />
        <Input.TextArea rows={4} value={unsignedPsbt} onChange={(event) => setUnsignedPsbt(event.target.value)} placeholder="Unsigned swap PSBT — hex or base64" />
        <Space wrap className="rgb-payment-actions">
          <Button type="primary" loading={isLoading} onClick={() => void prepareSeller()}>Prepare seller swap</Button>
          <Button loading={isLoading} disabled={!transferId || !coloredPsbt} onClick={() => void publishSeller()}>Sign seller inputs & publish</Button>
        </Space>
        <div className="rgb-form-grid rgb-payment-actions">
          <label>Seller transfer ID<Input value={transferId} onChange={(event) => setTransferId(event.target.value)} /></label>
          <label>Colored unsigned PSBT<Input.TextArea rows={4} value={coloredPsbt} onChange={(event) => setColoredPsbt(event.target.value)} /></label>
          <label>Seller partial PSBT<Input.TextArea rows={4} value={sellerPartialPsbt} onChange={(event) => setSellerPartialPsbt(event.target.value)} /></label>
        </div>
      </DemoField>

      <DemoField label="3. Buyer wallet — sign only buyer BTC inputs">
        <Alert type="info" showIcon message="Switch back to the buyer wallet" description="Wait until getPendingReceives shows this invoice as PendingAccept, then sign the colored PSBT without seller signatures." />
        <Button type="primary" loading={isLoading} disabled={!recipientId || !coloredPsbt} onClick={() => void signBuyer()}>Sign buyer partial PSBT</Button>
        <div className="rgb-form-grid rgb-payment-actions">
          <label>Buyer transaction ID<Input value={buyerTxid} onChange={(event) => setBuyerTxid(event.target.value)} /></label>
          <label>Buyer partial PSBT<Input.TextArea rows={4} value={buyerPartialPsbt} onChange={(event) => {
            setBuyerPartialPsbt(event.target.value);
            setBuyerSignedPsbtHash('');
          }} /></label>
          <label>SHA-256 of binary buyer PSBT<Input value={buyerSignedPsbtHash} onChange={(event) => setBuyerSignedPsbtHash(event.target.value)} /></label>
        </div>
      </DemoField>

      <DemoField label="4. Seller wallet — sign the buyer commitment">
        <Alert type="warning" showIcon message="This permanently binds the first buyer PSBT hash" description="Switch to the seller wallet. An identical retry is allowed; a different hash for this transfer is rejected." />
        <Button type="primary" loading={isLoading} disabled={!transferId || !buyerTxid || !buyerPartialPsbt} onClick={() => void signSellerCommitment()}>Sign buyer swap commitment (v1.8.4+)</Button>
        <div className="rgb-form-grid rgb-payment-actions">
          <label>Proxy transfer ID<Input value={proxyTransferId} onChange={(event) => setProxyTransferId(event.target.value)} /></label>
          <label>Seller commitment<Input.TextArea rows={3} value={commitment} onChange={(event) => setCommitment(event.target.value)} /></label>
        </div>
      </DemoField>

      <DemoField label="5. Buyer wallet — verify commitment and ACK">
        <Alert type="info" showIcon message="Switch to the buyer wallet" description="acceptBuySwap verifies that the commitment belongs to the Proxy sender and to this exact buyer partial PSBT." />
        <Button type="primary" loading={isLoading} disabled={!recipientId || !commitment} onClick={() => void acceptBuyer()}>Accept buy swap</Button>
      </DemoField>

      <DemoField label="6. Seller wallet — combine, confirm and broadcast">
        <Alert type="warning" showIcon message="Switch to the seller wallet before confirmation" description="The page combines both partial PSBTs. confirmSellSwap verifies the buyer ACK and the final transaction, but does not broadcast it." />
        <Space wrap>
          <Button loading={isLoading} disabled={!sellerPartialPsbt || !buyerPartialPsbt} onClick={() => void combinePartials()}>Combine partial PSBTs</Button>
          <Button type="primary" loading={isLoading} disabled={!transferId || !combinedPsbt} onClick={() => void confirmSeller()}>Confirm seller swap</Button>
          <Button loading={isLoading} disabled={!confirmedPsbt} onClick={() => void broadcast()}>Finalize & broadcast</Button>
          <Button loading={isLoading} disabled={!transferId} onClick={() => void checkStatus()}>Check status</Button>
        </Space>
        <div className="rgb-form-grid rgb-payment-actions">
          <label>Combined fully signed PSBT<Input.TextArea rows={4} value={combinedPsbt} onChange={(event) => setCombinedPsbt(event.target.value)} /></label>
          <label>Wallet-confirmed PSBT<Input.TextArea rows={4} value={confirmedPsbt} onChange={(event) => setConfirmedPsbt(event.target.value)} /></label>
        </div>
      </DemoField>

      {status && (
        <div className="rgb-payment-status">
          <div><span>Swap status</span><Tag>{status.status || 'unknown'}</Tag></div>
          <dl>
            <div><dt>Transfer ID</dt><dd>{status.transferId || transferId}</dd></div>
            {status.txid && <div><dt>Transaction ID</dt><dd>{status.txid}</dd></div>}
          </dl>
        </div>
      )}
    </DemoCard>
  );
}
