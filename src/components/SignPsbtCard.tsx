import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Input, Radio } from "antd";

export function SignPsbtCard() {
  const [psbtHex, setPsbtHex] = useState("");
  const [psbtResult, setPsbtResult] = useState("");
  const [result, setResult] = useState({
    success: false,
    error: "",
    data: "",
  });
  const doc_url =
    "https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#signpsbt";
  return (
    <Card size="small" title="Sign Psbt" style={{ margin: 10 }}>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Docs:</div>
        <a href={doc_url} target="_blank">
          {doc_url}
        </a>
      </div>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>PsbtHex:</div>
        <Input
          defaultValue={psbtHex}
          onChange={(e) => {
            setPsbtHex(e.target.value);
          }}
        ></Input>
      </div>

      {result.success ? (
        <div style={{ textAlign: "left", marginTop: 10 }}>
          <div style={{ fontWeight: "bold" }}>Result:</div>
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
            const psbtResult = await (window as any).unisat.signPsbt(psbtHex);

            setResult({
              success: true,
              error: "",
              data: psbtResult,
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
