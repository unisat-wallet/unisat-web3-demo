import { useState } from 'react';
import { address, networks, Psbt } from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import { Alert, Button, Input, Select, Space, Tag } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { getUnisat, useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

type SwapStatus = { transferId?: string; status?: string; txid?: string; error?: string };

export const rgbSellSwapConfig: DemoConfig = {
  key: 'rgbBackendSwap',
  title: 'RGB Swap — Backend-Coordinated',
  category: 'rgb',
  apiMethod: 'prepareSwap (v1.8.3+) / signSellSwapAndPublishConsignment (v1.8.3+) / syncSellSwapAck (v1.8.4+)',
  description: 'Test the flow where the backend is the RGB receiver, retains the final transaction, and broadcasts it.',
};

export function RgbSellSwapDemo() {
  const [invoice, setInvoice] = useState('');
  const [assetId, setAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const [btcReceiveAmount, setBtcReceiveAmount] = useState('');
  const [feeRate, setFeeRate] = useState('');
  const [unsignedPsbt, setUnsignedPsbt] = useState('');
  const [coloredPsbt, setColoredPsbt] = useState('');
  const [transferId, setTransferId] = useState('');
  const [makerSignedPsbt, setMakerSignedPsbt] = useState('');
  const [status, setStatus] = useState<SwapStatus>();
  const { result, execute, isLoading } = useDemoExecution();

  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet');
  const [rgbInputTxid, setRgbInputTxid] = useState('');
  const [rgbInputVout, setRgbInputVout] = useState('0');
  const [rgbInputSats, setRgbInputSats] = useState('');
  const [rgbInputScript, setRgbInputScript] = useState('');
  const [makerInputTxid, setMakerInputTxid] = useState('');
  const [makerInputVout, setMakerInputVout] = useState('0');
  const [makerInputSats, setMakerInputSats] = useState('');
  const [makerInputScript, setMakerInputScript] = useState('');
  const [userFeeInputTxid, setUserFeeInputTxid] = useState('');
  const [userFeeInputVout, setUserFeeInputVout] = useState('0');
  const [userFeeInputSats, setUserFeeInputSats] = useState('');
  const [userFeeInputScript, setUserFeeInputScript] = useState('');
  const [btcReceiveAddress, setBtcReceiveAddress] = useState('');
  const [rgbChangeSats, setRgbChangeSats] = useState('');
  const [rgbChangeScript, setRgbChangeScript] = useState('');
  const [makerChangeAddress, setMakerChangeAddress] = useState('');
  const [minerFeeSats, setMinerFeeSats] = useState('500');

  const loadFirstFundingUtxo = async () => {
    try {
      const response = await execute(async () => {
        if (!assetId.trim()) throw new Error('Enter the RGB asset ID in step 1 first');
        return getUnisat().rgb.getFundingUtxos(assetId.trim());
      }, (data) => JSON.stringify(data, null, 2));
      const utxo = response?.utxos?.[0];
      if (!utxo) throw new Error('No eligible RGB funding UTXO was returned');
      setRgbInputTxid(utxo.txid);
      setRgbInputVout(String(utxo.vout));
      setRgbInputSats(String(utxo.satoshis));
      setRgbInputScript(utxo.scriptPubKey);
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const loadFirstFeeUtxo = async () => {
    try {
      const response = await execute<any>(
        () => getUnisat().rgb.getFeeUtxos(),
        (data) => JSON.stringify(data, null, 2),
      );
      const utxo = response?.utxos?.[0];
      if (!utxo) throw new Error('No eligible RGB fee-pool UTXO was returned');
      setUserFeeInputTxid(utxo.txid);
      setUserFeeInputVout(String(utxo.vout));
      setUserFeeInputSats(String(utxo.satoshis));
      setUserFeeInputScript(utxo.scriptPubKey);
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const generateMakerPsbt = async () => {
    try {
      await execute(async () => {
        const parseSats = (value: string, label: string) => {
          if (!/^(0|[1-9][0-9]*)$/.test(value.trim())) throw new Error(`${label} must be an unsigned integer`);
          const parsed = Number(value);
          if (!Number.isSafeInteger(parsed)) throw new Error(`${label} is out of range`);
          return parsed;
        };
        const parseVout = (value: string, label: string) => {
          if (!/^(0|[1-9][0-9]*)$/.test(value.trim())) throw new Error(`${label} must be a non-negative integer`);
          return Number(value);
        };
        const parseScript = (value: string, label: string) => {
          const script = value.trim();
          if (!/^[0-9a-fA-F]+$/.test(script) || script.length % 2) throw new Error(`${label} must be hexadecimal scriptPubKey`);
          return Buffer.from(script, 'hex');
        };
        const assertTxid = (value: string, label: string) => {
          const txid = value.trim();
          if (!/^[0-9a-fA-F]{64}$/.test(txid)) throw new Error(`${label} must be a 32-byte txid`);
          return txid;
        };

        const rgbSats = parseSats(rgbInputSats, 'RGB input sats');
        const makerSats = parseSats(makerInputSats, 'Maker input sats');
        const userFeeSats = userFeeInputSats.trim() ? parseSats(userFeeInputSats, 'User fee input sats') : 0;
        const receiveSats = parseSats(btcReceiveAmount, 'BTC receive amount');
        const minerFee = parseSats(minerFeeSats, 'Miner fee');
        const rgbChange = rgbChangeSats.trim() ? parseSats(rgbChangeSats, 'RGB change sats') : 0;
        if ((rgbChange > 0 && !rgbChangeScript.trim()) || (rgbChange === 0 && rgbChangeScript.trim())) {
          throw new Error('Provide both RGB change sats and RGB change script, or leave both blank');
        }
        if (userFeeSats > 0 && (!userFeeInputTxid.trim() || !userFeeInputScript.trim())) {
          throw new Error('Provide user fee input txid and script, or leave all user fee input fields blank');
        }
        const makerChange = rgbSats + makerSats + userFeeSats - receiveSats - rgbChange - minerFee;
        if (makerChange < 0) throw new Error('Inputs do not cover BTC receive amount, RGB change and miner fee');
        if (!makerChangeAddress.trim()) throw new Error('Maker change address is required');

        const bitcoinNetwork = network === 'mainnet' ? networks.bitcoin : networks.testnet;
        const psbt = new Psbt({ network: bitcoinNetwork });
        psbt.addInput({
          hash: assertTxid(rgbInputTxid, 'RGB input txid'),
          index: parseVout(rgbInputVout, 'RGB input vout'),
          sequence: 0xffffffff,
          witnessUtxo: { value: rgbSats, script: parseScript(rgbInputScript, 'RGB input script') },
        });
        psbt.addInput({
          hash: assertTxid(makerInputTxid, 'Maker input txid'),
          index: parseVout(makerInputVout, 'Maker input vout'),
          sequence: 0xffffffff,
          witnessUtxo: { value: makerSats, script: parseScript(makerInputScript, 'Maker input script') },
        });
        if (userFeeSats > 0) {
          psbt.addInput({
            hash: assertTxid(userFeeInputTxid, 'User fee input txid'),
            index: parseVout(userFeeInputVout, 'User fee input vout'),
            sequence: 0xffffffff,
            witnessUtxo: { value: userFeeSats, script: parseScript(userFeeInputScript, 'User fee input script') },
          });
        }
        psbt.addOutput({ script: Buffer.from([0x6a]), value: 0 });
        psbt.addOutput({ address: btcReceiveAddress.trim(), value: receiveSats });
        if (rgbChange > 0) psbt.addOutput({ script: parseScript(rgbChangeScript, 'RGB change script'), value: rgbChange });
        psbt.addOutput({ address: makerChangeAddress.trim(), value: makerChange });

        // Verify both user-facing addresses against the selected chain before exposing the template.
        address.toOutputScript(btcReceiveAddress.trim(), bitcoinNetwork);
        address.toOutputScript(makerChangeAddress.trim(), bitcoinNetwork);
        const template = psbt.toBase64();
        setUnsignedPsbt(template);
        return {
          psbt: template,
          estimatedMinerFeeSats: minerFee,
          makerChangeSats: makerChange,
          outputs: psbt.txOutputs.length,
        };
      }, (data) => JSON.stringify(data, null, 2));
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const prepare = async () => {
    try {
      const response = await execute(async () => {
        if (!invoice.trim() || !assetId.trim() || !amount.trim() || !btcReceiveAmount.trim() || !unsignedPsbt.trim()) {
          throw new Error('Invoice, asset ID, RGB amount, BTC receive amount and unsigned PSBT are required');
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
      if (response?.transferId) {
        setTransferId(response.transferId);
        setColoredPsbt(response.coloredPsbt || '');
        setMakerSignedPsbt(response.coloredPsbt || '');
        setStatus(response);
      }
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const publish = async () => {
    try {
      const response = await execute(async () => {
        if (!transferId.trim() || !makerSignedPsbt.trim()) throw new Error('Transfer ID and maker-signed PSBT are required');
        return getUnisat().rgb.signSellSwapAndPublishConsignment(transferId.trim(), makerSignedPsbt.trim());
      }, (data) => JSON.stringify(data, null, 2));
      if (response) {
        setStatus(response);
        if (response.makerSignedPsbt) setMakerSignedPsbt(response.makerSignedPsbt);
      }
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const syncAck = async () => {
    try {
      const response = await execute(async () => {
        if (!transferId.trim()) throw new Error('Transfer ID is required');
        return getUnisat().rgb.syncSellSwapAck(transferId.trim());
      }, (data) => JSON.stringify(data, null, 2));
      if (response) setStatus(response);
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const cancel = async () => {
    try {
      const response = await execute(async () => {
        if (!transferId.trim()) throw new Error('Enter a transfer ID first');
        return getUnisat().rgb.cancelSwap(transferId.trim());
      }, (data) => JSON.stringify(data, null, 2));
      if (response) setStatus({ ...response, transferId, status: response.status || 'canceled' });
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const applyAbort = async () => {
    try {
      const response = await execute(async () => {
        if (!transferId.trim()) throw new Error('Enter a transfer ID first');
        return getUnisat().rgb.applySellSwapAbort(transferId.trim());
      }, (data) => JSON.stringify(data, null, 2));
      if (response) setStatus({ ...response, transferId, status: response.status || 'canceled' });
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  const checkStatus = async () => {
    try {
      const response = await execute(async () => {
        if (!transferId.trim()) throw new Error('Enter a transfer ID first');
        return getUnisat().rgb.getOperationStatus(transferId.trim());
      }, (data) => JSON.stringify(data, null, 2));
      if (response) setStatus(response);
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  return (
    <DemoCard config={rgbSellSwapConfig} result={result}>
      <Alert type="warning" showIcon message="Backend-coordinated mode — requires UniSat Wallet v1.8.4+" description="The backend owns the receive invoice, completes and durably stores the final transaction, posts the receiver ACK, and broadcasts. Do not use confirmSellSwap or signBuySwapCommit in this mode." />
      <DemoField label="0. Simple maker unsigned-PSBT builder">
        <Alert type="info" showIcon message="Testing helper" description="Create one RGB carrier input, one maker BTC input, and optionally one user fee-pool input. The builder creates vout 0 as an empty OP_RETURN, sends BTC to the seller, optionally adds RGB change, and derives maker BTC change from the fee you enter. It does not sign or broadcast anything." />
        <Space wrap className="rgb-payment-actions">
          <Button loading={isLoading} onClick={() => void loadFirstFundingUtxo()}>Load first eligible RGB funding UTXO</Button>
          <Button loading={isLoading} onClick={() => void loadFirstFeeUtxo()}>Load first user RGB fee-pool UTXO</Button>
        </Space>
        <div className="rgb-form-grid">
          <label>Network<Select value={network} onChange={setNetwork} options={[{ value: 'testnet', label: 'Testnet / Testnet4 / Signet' }, { value: 'mainnet', label: 'Mainnet' }]} /></label>
          <label>User BTC receive address <em>the output amount below must include any user fee change</em><Input value={btcReceiveAddress} onChange={(event) => setBtcReceiveAddress(event.target.value)} /></label>
          <label>RGB input txid<Input value={rgbInputTxid} onChange={(event) => setRgbInputTxid(event.target.value)} /></label>
          <label>RGB input vout<Input value={rgbInputVout} onChange={(event) => setRgbInputVout(event.target.value)} /></label>
          <label>RGB input sats<Input value={rgbInputSats} onChange={(event) => setRgbInputSats(event.target.value)} /></label>
          <label>RGB input scriptPubKey<Input value={rgbInputScript} onChange={(event) => setRgbInputScript(event.target.value)} placeholder="5120..." /></label>
          <label>Maker BTC input txid<Input value={makerInputTxid} onChange={(event) => setMakerInputTxid(event.target.value)} /></label>
          <label>Maker BTC input vout<Input value={makerInputVout} onChange={(event) => setMakerInputVout(event.target.value)} /></label>
          <label>Maker BTC input sats<Input value={makerInputSats} onChange={(event) => setMakerInputSats(event.target.value)} /></label>
          <label>Maker BTC input scriptPubKey<Input value={makerInputScript} onChange={(event) => setMakerInputScript(event.target.value)} /></label>
          <label>User fee input txid <em>optional</em><Input value={userFeeInputTxid} onChange={(event) => setUserFeeInputTxid(event.target.value)} /></label>
          <label>User fee input vout <em>optional</em><Input value={userFeeInputVout} onChange={(event) => setUserFeeInputVout(event.target.value)} /></label>
          <label>User fee input sats <em>optional</em><Input value={userFeeInputSats} onChange={(event) => setUserFeeInputSats(event.target.value)} /></label>
          <label>User fee input scriptPubKey <em>optional</em><Input value={userFeeInputScript} onChange={(event) => setUserFeeInputScript(event.target.value)} /></label>
          <label>RGB change sats <em>optional — use when selling only part of input allocation</em><Input value={rgbChangeSats} onChange={(event) => setRgbChangeSats(event.target.value)} /></label>
          <label>RGB change scriptPubKey <em>optional — wallet RGB funding script</em><Input value={rgbChangeScript} onChange={(event) => setRgbChangeScript(event.target.value)} /></label>
          <label>Miner fee<Input value={minerFeeSats} onChange={(event) => setMinerFeeSats(event.target.value)} placeholder="Sats" /></label>
          <label>Maker BTC change address<Input value={makerChangeAddress} onChange={(event) => setMakerChangeAddress(event.target.value)} /></label>
        </div>
        <Button loading={isLoading} onClick={() => void generateMakerPsbt()}>Generate maker unsigned PSBT</Button>
      </DemoField>
      <DemoField label="1. Prepare seller swap">
        <div className="rgb-form-grid">
          <label>Maker RGB invoice<Input.TextArea rows={3} value={invoice} onChange={(event) => setInvoice(event.target.value)} /></label>
          <label>Asset ID<Input value={assetId} onChange={(event) => setAssetId(event.target.value)} placeholder="rgb:..." /></label>
          <label>RGB amount<Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Atomic units" /></label>
          <label>Minimum BTC received<Input value={btcReceiveAmount} onChange={(event) => setBtcReceiveAmount(event.target.value)} placeholder="Sats" /></label>
          <label>Fee rate <em>optional — sats/vB</em><Input value={feeRate} onChange={(event) => setFeeRate(event.target.value)} /></label>
          <label>Maker unsigned PSBT<Input.TextArea rows={4} value={unsignedPsbt} onChange={(event) => setUnsignedPsbt(event.target.value)} placeholder="Base64 or hex" /></label>
        </div>
        <Button type="primary" loading={isLoading} onClick={() => void prepare()}>Prepare & color swap</Button>
      </DemoField>
      {coloredPsbt && <DemoField label="Colored PSBT — send this exact value to the backend"><Input.TextArea readOnly rows={4} value={coloredPsbt} /></DemoField>}
      <DemoField label="2. Add seller signatures and publish consignment">
        <Input value={transferId} onChange={(event) => setTransferId(event.target.value)} placeholder="Transfer ID returned by prepareSwap" />
        <Input.TextArea rows={4} value={makerSignedPsbt} onChange={(event) => setMakerSignedPsbt(event.target.value)} placeholder="Colored PSBT presented for seller-wallet signing" />
        <Space wrap className="rgb-payment-actions">
          <Button type="primary" loading={isLoading} disabled={!transferId.trim() || !makerSignedPsbt.trim()} onClick={() => void publish()}>Sign seller inputs & publish</Button>
          <Button loading={isLoading} disabled={!transferId.trim()} onClick={() => void checkStatus()}>Check status</Button>
          <Button danger loading={isLoading} disabled={!transferId.trim()} onClick={() => void cancel()}>Cancel before ACK</Button>
        </Space>
      </DemoField>
      <DemoField label="3. Synchronize the backend receiver ACK">
        <Alert type="info" showIcon message="Backend completes the off-page steps" description="Before posting ACK, the backend must validate and durably store the exact final transaction. After this call reports receiver_acked, the backend broadcasts; the wallet only observes chain status." />
        <Space wrap className="rgb-payment-actions">
          <Button type="primary" loading={isLoading} disabled={!transferId.trim()} onClick={() => void syncAck()}>Sync Proxy ACK (v1.8.4+)</Button>
          <Button loading={isLoading} disabled={!transferId.trim()} onClick={() => void checkStatus()}>Check chain status</Button>
        </Space>
      </DemoField>
      <DemoField label="4. Terminal recovery after ACK">
        <Alert type="warning" showIcon message="Mutual agreement required" description="Only apply this local abort after both participants have signed and verified that the transaction is terminally unbroadcastable." />
        <Button danger loading={isLoading} disabled={!transferId.trim()} onClick={() => void applyAbort()}>Apply mutually agreed seller abort</Button>
      </DemoField>
      {status && <div className="rgb-payment-status"><div><span>Swap status</span><Tag>{status.status || 'unknown'}</Tag></div><dl><div><dt>Transfer ID</dt><dd>{status.transferId || transferId}</dd></div>{status.txid && <div><dt>Transaction ID</dt><dd>{status.txid}</dd></div>}</dl></div>}
    </DemoCard>
  );
}
