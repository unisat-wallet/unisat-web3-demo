import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Input, Radio } from "antd";

export function InscribeTransferCard() {
  const [ticker, setTicker] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState({
    success: false,
    error: "",
  });

  const doc_url =
    "https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#pushtx";

  return (
    <Card size="small" title="InscribeTransfer" style={{ margin: 10 }}>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Docs:</div>
        <a href={doc_url} target="_blank">
          {doc_url}
        </a>
      </div>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Ticker:</div>
        <Input
          defaultValue={ticker}
          onChange={(e) => {
            setTicker(e.target.value);
          }}
        ></Input>
      </div>

      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Amount: </div>
        <Input
          defaultValue={amount}
          onChange={(e) => {
            setAmount(e.target.value);
          }}
        ></Input>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          setResult({
            success: false,
            error: "Requesting...",
          });
          try {
            await (window as any).unisat.inscribeTransfer(ticker, amount);
            setResult({
              success: true,
              error: "",
            });
          } catch (e) {
            setResult({
              success: false,
              error: (e as any).message,
            });
          }
        }}
      >
        Submit
      </Button>
    </Card>
  );
}
