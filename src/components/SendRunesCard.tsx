import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Input, Radio } from "antd";

export function SendRunesCard() {
  const [toAddress, setToAddress] = useState("");
  const [runeid, setRuneid] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState({
    success: false,
    error: "",
    data: "",
  });
  const doc_url =
    "https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#sendrunes";
  return (
    <Card size="small" title="Send Runes" style={{ margin: 10 }}>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Docs:</div>
        <a href={doc_url} target="_blank">
          {doc_url}
        </a>
      </div>

      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Receiver Address:</div>
        <Input
          defaultValue={toAddress}
          onChange={(e) => {
            setToAddress(e.target.value);
          }}
        ></Input>
      </div>

      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Runeid: </div>
        <Input
          defaultValue={runeid}
          onChange={(e) => {
            setRuneid(e.target.value);
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

      {result.success ? (
        <div style={{ textAlign: "left", marginTop: 10 }}>
          <div style={{ fontWeight: "bold" }}>Txid:</div>
          <div style={{ wordWrap: "break-word" }}>{result.data}</div>
        </div>
      ) : (
        <div style={{ textAlign: "left", marginTop: 10 }}>
          <div style={{ wordWrap: "break-word" }}>{result.error}</div>
        </div>
      )}

      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          setResult({
            success: false,
            error: "Requesting...",
            data: "",
          });
          try {
            const txid = await (window as any).unisat.sendRunes(
              toAddress,
              runeid,
              amount
            );

            setResult({
              success: true,
              error: "",
              data: txid,
            });
          } catch (e) {
            setResult({
              success: false,
              error: (e as any).message,
              data: "",
            });
          }
        }}
      >
        Submit
      </Button>
    </Card>
  );
}
