# RGB Swap testing

The demo contains two independent swap models. Select the model that matches
who owns the receiver key and the final transaction. Do not mix calls between
the two models.

## Version requirements

| Method | Minimum UniSat Wallet version |
| --- | --- |
| `createReceiveInvoice({ purpose: 'buy_swap' })` | v1.8.3 |
| `prepareSwap` | v1.8.3 |
| `signSellSwapAndPublishConsignment` | v1.8.3 |
| `signBuySwap` | v1.8.3 |
| `acceptBuySwap` | v1.8.3 |
| `confirmSellSwap` | v1.8.3 |
| `cancelSwap` / `getOperationStatus` | v1.8.3 |
| `syncSellSwapAck` | **v1.8.4** |
| `signBuySwapCommit` | **v1.8.4** |

Both complete flows documented below require **v1.8.4 or later**, because
each flow contains one of the new v1.8.4 methods. Applications should feature
detect the required function as well as checking the wallet version.

## 1. Backend-coordinated swap

Use **RGB Swap — Backend-Coordinated** when the backend is the RGB receiver,
retains the complete transaction, posts the Proxy ACK, and broadcasts.

### Seller wallet calls

```ts
// v1.8.3+
const prepared = await window.unisat.rgb.prepareSwap({
  invoice: backendReceiveInvoice,
  assetId,
  amount,              // RGB atomic units, as a string
  btcReceiveAmount,    // sats, as a string
  feeRate,
  psbt: unsignedSwapPsbt,
})

// v1.8.3+
const published = await window.unisat.rgb.signSellSwapAndPublishConsignment(
  prepared.transferId,
  prepared.coloredPsbt,
)

// Call repeatedly after the backend has validated and durably stored the
// exact final transaction and posted the positive receiver ACK.
// v1.8.4+
const ack = await window.unisat.rgb.syncSellSwapAck(published.transferId)
// waiting_ack | receiver_acked | rejected | expired

const status = await window.unisat.rgb.getOperationStatus(
  published.transferId,
)
```

The backend broadcasts only after `syncSellSwapAck` returns
`receiver_acked`. This wallet method does not receive or return a complete
PSBT and does not broadcast.

## 2. Pure P2P swap

Use **RGB Swap — Pure P2P** when the buyer and seller use separate UniSat
wallets and the trading page combines and broadcasts their partial PSBTs.

### Buyer: create the invoice

```ts
// v1.8.3+
const receive = await window.unisat.rgb.createReceiveInvoice({
  assetId,
  amount,
  purpose: 'buy_swap',
})
```

### Seller: prepare, sign, and publish

```ts
// v1.8.3+
const prepared = await window.unisat.rgb.prepareSwap({
  invoice: receive.invoice,
  assetId,
  amount,
  btcReceiveAmount,
  feeRate,
  psbt: unsignedSwapPsbt,
})

// v1.8.3+
const sellerPartial =
  await window.unisat.rgb.signSellSwapAndPublishConsignment(
    prepared.transferId,
    prepared.coloredPsbt,
  )
```

### Buyer: sign buyer inputs

Wait until the invoice appears as `PendingAccept`, then switch to the buyer
wallet:

```ts
// v1.8.3+
const buyerPartial = await window.unisat.rgb.signBuySwap({
  recipientId: receive.recipientId,
  assetId,
  amount,
  maxBtcSpend,
  swapPsbt: prepared.coloredPsbt,
})
```

`swapPsbt` must be the unsigned colored PSBT, without seller signatures.

### Seller: authorize this buyer PSBT

Hash the decoded binary PSBT, not its hex/base64 text:

```ts
import { crypto, Psbt } from 'bitcoinjs-lib'

const parsePsbt = (value: string) =>
  /^[0-9a-f]+$/i.test(value)
    ? Psbt.fromHex(value)
    : Psbt.fromBase64(value)

const buyerSignedPsbtHash = crypto
  .sha256(parsePsbt(buyerPartial.buyerSignedPsbt).toBuffer())
  .toString('hex')

// v1.8.4+
const authorization = await window.unisat.rgb.signBuySwapCommit(
  prepared.transferId,
  buyerPartial.txid,
  buyerSignedPsbtHash,
)
```

### Buyer: verify the seller commitment and ACK

```ts
// v1.8.3+
await window.unisat.rgb.acceptBuySwap({
  recipientId: receive.recipientId,
  backendCommit: authorization.commitment,
})
```

`backendCommit` is the compatibility field name. In this model it contains
the commitment signed by the seller wallet's per-transfer Proxy key.

### Trading page and seller: combine, confirm, and broadcast

```ts
const complete = parsePsbt(sellerPartial.makerSignedPsbt)
complete.combine(parsePsbt(buyerPartial.buyerSignedPsbt))

// v1.8.3+
const ready = await window.unisat.rgb.confirmSellSwap(
  prepared.transferId,
  complete.toHex(),
)

const finalPsbt = parsePsbt(ready.signedPsbt)
finalPsbt.finalizeAllInputs()
const txid = await window.unisat.pushPsbt(finalPsbt.toHex())
```

The demo accepts either hex or base64 PSBTs. In production, use the same
format-aware parser shown above when combining or finalizing them.

## Safety rules

- Backend mode uses `syncSellSwapAck`; pure P2P mode uses
  `signBuySwapCommit` and `confirmSellSwap`.
- Never post a positive ACK before the exact final transaction has been
  validated and is recoverably stored.
- A positive ACK disables unilateral cancellation. Terminal recovery requires
  agreement from both participants.
- Always verify that both partial PSBTs describe the same unsigned transaction
  before combining them.
