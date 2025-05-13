import React, { useState } from 'react';
import { Button, Card, Input, Space, Divider, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

export function MultiSignMessageCard() {
  const [messages, setMessages] = useState([
    { text: 'hello world~', type: '' },
    { text: 'test message', type: 'bip322-simple' },
  ]);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addMessage = () => {
    setMessages([...messages, { text: '', type: '' }]);
  };

  const removeMessage = (index: number) => {
    const newMessages = [...messages];
    newMessages.splice(index, 1);
    setMessages(newMessages);
  };

  const updateMessage = (
    index: number,
    field: 'text' | 'type',
    value: string
  ) => {
    const newMessages = [...messages];
    newMessages[index] = {
      ...newMessages[index],
      [field]: value,
    };
    setMessages(newMessages);
  };

  const handleSignMessages = async () => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const signatures = await (window as any).unisat.multiSignMessage(
        messages
      );
      setResults(signatures);
      message.success('All messages signed successfully!');
    } catch (e) {
      setError((e as any).message || 'Failed to sign messages');
      message.error('Failed to sign messages');
    } finally {
      setLoading(false);
    }
  };

  const doc_url =
    'https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#multisignmessage';

  return (
    <Card size="small" title="Multi Sign Messages" className="function-card">
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Docs:</div>
        <a
          href={doc_url}
          target="_blank"
          rel="noreferrer"
          style={{ wordBreak: 'break-all' }}
        >
          {doc_url}
        </a>
      </div>

      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Messages:</div>

        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: 15 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Message {index + 1}:</span>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeMessage(index)}
                  disabled={messages.length <= 1}
                />
              </div>
              <Input
                value={msg.text}
                onChange={(e) => updateMessage(index, 'text', e.target.value)}
                placeholder="Enter message"
              />
              <div className="message-type-selector">
                <span style={{ marginRight: 10 }}>Type:</span>
                <Space wrap>
                  <Button
                    type={msg.type === '' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => updateMessage(index, 'type', '')}
                  >
                    ecdsa
                  </Button>
                  <Button
                    type={msg.type === 'bip322-simple' ? 'primary' : 'default'}
                    size="small"
                    onClick={() =>
                      updateMessage(index, 'type', 'bip322-simple')
                    }
                  >
                    bip322-simple
                  </Button>
                </Space>
              </div>
            </Space>

            {index < messages.length - 1 && (
              <Divider style={{ margin: '15px 0' }} />
            )}
          </div>
        ))}

        <Button
          type="dashed"
          onClick={addMessage}
          style={{ width: '100%', marginTop: 10 }}
          icon={<PlusOutlined />}
        >
          Add Message
        </Button>
      </div>

      {error && (
        <div style={{ textAlign: 'left', marginTop: 10, color: 'red' }}>
          <div style={{ fontWeight: 'bold' }}>Error:</div>
          <div style={{ wordWrap: 'break-word' }}>{error}</div>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ textAlign: 'left', marginTop: 10 }}>
          <div style={{ fontWeight: 'bold' }}>Signatures:</div>
          {results.map((signature, index) => (
            <div
              key={index}
              style={{ wordWrap: 'break-word', marginBottom: 10 }}
            >
              <div>
                <b>Message {index + 1}:</b>
              </div>
              <div>{signature}</div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="primary"
        style={{ marginTop: 10 }}
        onClick={handleSignMessages}
        loading={loading}
        disabled={messages.some((msg) => !msg.text)}
        block
      >
        Sign All Messages
      </Button>
    </Card>
  );
}
