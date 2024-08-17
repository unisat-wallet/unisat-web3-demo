import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Input, Radio } from "antd";

export function SignMessageCard() {
  const [message, setMessage] = useState("hello world~");
  const [result, setResult] = useState({
    success: false,
    error: "",
    data: "",
  });
  const doc_url =
    "https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#signmessage";
  return (
    <Card size="small" title="Sign Message" style={{ margin: 10 }}>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Docs:</div>
        <a href={doc_url} target="_blank">
          {doc_url}
        </a>
      </div>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Message:</div>
        <Input
          defaultValue={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        ></Input>
      </div>
      {result.success ? (
        <div style={{ textAlign: "left", marginTop: 10 }}>
          <div style={{ fontWeight: "bold" }}>Signature:</div>
          <div style={{ wordWrap: "break-word" }}>{result.data}</div>
        </div>
      ) : (
        <div style={{ textAlign: "left", marginTop: 10 }}>
          <div style={{ wordWrap: "break-word" }}>{result.error}</div>
        </div>
      )}

      <Button
        style={{ margin: 10 }}
        onClick={async () => {
          setResult({
            success: false,
            error: "Requesting...",
            data: "",
          });
          try {
            const signature = await (window as any).unisat.signMessage(message);
            setResult({
              success: true,
              error: "",
              data: signature,
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
        Sign By ecdsa
      </Button>

      <Button
        style={{ margin: 10 }}
        onClick={async () => {
          setResult({
            success: false,
            error: "Requesting...",
            data: "",
          });
          try {
            const signature = await (window as any).unisat.signMessage(
              message,
              "bip322-simple"
            );
            setResult({
              success: true,
              error: "",
              data: signature,
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
        Sign By bip322-simple
      </Button>
    </Card>
  );
}
