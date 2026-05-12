import { useState } from 'react';
import { Button, Input, Space, Divider, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { DemoCard, DemoField } from '../components/DemoCard';
import { getUnisat } from '../hooks/useDemoExecution';
import type { DemoConfig, DemoResult } from '../types';

export const multiSignMessageConfig: DemoConfig = {
  key: 'multiSignMessage',
  title: 'Multi Sign Messages',
  category: 'advanced',
  apiMethod: 'unisat.multiSignMessage',
  docUrl: 'https://github.com/unisat-wallet/wallet/blob/master/docs/api/sign-message.md#multisignmessage',
  description: 'Sign multiple messages in a single request with different signature types.',
  walletConnectSupported: false,
};

interface MessageItem {
  text: string;
  type: '' | 'bip322-simple';
}

export function MultiSignMessageDemo() {
  const [messages, setMessages] = useState<MessageItem[]>([
    { text: 'hello world~', type: '' },
    { text: 'test message', type: 'bip322-simple' },
  ]);
  const [result, setResult] = useState<DemoResult>({ status: 'idle' });
  const [signatures, setSignatures] = useState<string[]>([]);

  const addMessage = () => {
    setMessages([...messages, { text: '', type: '' }]);
  };

  const removeMessage = (index: number) => {
    const newMessages = [...messages];
    newMessages.splice(index, 1);
    setMessages(newMessages);
  };

  const updateMessage = (index: number, field: keyof MessageItem, value: string) => {
    const newMessages = [...messages];
    newMessages[index] = { ...newMessages[index], [field]: value };
    setMessages(newMessages);
  };

  const handleSign = async () => {
    if (messages.some((msg) => !msg.text.trim())) {
      setResult({ status: 'error', error: 'All messages must have content' });
      return;
    }

    setResult({ status: 'loading' });
    setSignatures([]);

    try {
      const sigs = await getUnisat().multiSignMessage(messages);
      setSignatures(sigs);
      setResult({ status: 'success', data: `Signed ${sigs.length} messages` });
    } catch (e) {
      setResult({ status: 'error', error: e instanceof Error ? e.message : String(e) });
    }
  };

  return (
    <DemoCard config={multiSignMessageConfig} result={result}>
      <DemoField label="Messages">
        <div>
          {messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>Message {index + 1}</span>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => removeMessage(index)}
                  disabled={messages.length <= 1}
                />
              </div>
              <Input
                value={msg.text}
                onChange={(e) => updateMessage(index, 'text', e.target.value)}
                placeholder="Enter message"
                style={{ marginBottom: 8 }}
              />
              <Space>
                <span>Type:</span>
                <Button
                  type={msg.type === '' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => updateMessage(index, 'type', '')}
                >
                  ECDSA
                </Button>
                <Button
                  type={msg.type === 'bip322-simple' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => updateMessage(index, 'type', 'bip322-simple')}
                >
                  BIP-322
                </Button>
              </Space>
              {index < messages.length - 1 && <Divider style={{ margin: '12px 0' }} />}
            </div>
          ))}

          <Button
            type="dashed"
            onClick={addMessage}
            style={{ width: '100%', marginTop: 8 }}
            icon={<PlusOutlined />}
          >
            Add Message
          </Button>
        </div>
      </DemoField>

      {signatures.length > 0 && (
        <Alert
          type="info"
          style={{ marginTop: 16, textAlign: 'left' }}
          message="Signatures"
          description={
            <div style={{ maxHeight: 200, overflow: 'auto' }}>
              {signatures.map((sig, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 500 }}>Message {index + 1}:</div>
                  <div style={{ wordBreak: 'break-all', fontSize: 12 }}>{sig}</div>
                </div>
              ))}
            </div>
          }
        />
      )}

      <Button
        type="primary"
        loading={result.status === 'loading'}
        onClick={handleSign}
        style={{ marginTop: 16, width: '100%' }}
        disabled={messages.some((msg) => !msg.text.trim())}
      >
        Sign All Messages
      </Button>
    </DemoCard>
  );
}
