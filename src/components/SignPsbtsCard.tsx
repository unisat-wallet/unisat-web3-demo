import React, { useState } from 'react';
import { Button, Card, Input, Space, Divider, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export function SignPsbtsCard() {
  const [psbts, setPsbts] = useState([
    { psbtHex: '', options: {} },
    { psbtHex: '', options: {} },
  ]);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addPsbt = () => {
    setPsbts([...psbts, { psbtHex: '', options: {} }]);
  };

  const removePsbt = (index: number) => {
    const newPsbts = [...psbts];
    newPsbts.splice(index, 1);
    setPsbts(newPsbts);
  };

  const updatePsbt = (index: number, psbtHex: string) => {
    const newPsbts = [...psbts];
    newPsbts[index] = {
      ...newPsbts[index],
      psbtHex,
    };
    setPsbts(newPsbts);
  };

  const handleSignPsbts = async () => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      // 准备参数
      const psbtHexs = psbts.map((item) => item.psbtHex);
      const options = psbts.map((item) => item.options);

      // 调用signPsbts方法
      const signatures = await (window as any).unisat.signPsbts(
        psbtHexs,
        options
      );
      setResults(signatures);
      message.success('All PSBTs signed successfully!');
    } catch (e) {
      setError((e as any).message || 'Failed to sign PSBTs');
      message.error('Failed to sign PSBTs');
    } finally {
      setLoading(false);
    }
  };

  const doc_url =
    'https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#signpsbts';

  return (
    <Card size="small" title="Sign Multiple PSBTs" className="function-card">
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
        <div style={{ fontWeight: 'bold', marginBottom: 10 }}>PSBTs:</div>

        {psbts.map((psbt, index) => (
          <div key={index} style={{ marginBottom: 15 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>PSBT {index + 1}:</span>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removePsbt(index)}
                  disabled={psbts.length <= 1}
                />
              </div>
              <TextArea
                value={psbt.psbtHex}
                onChange={(e) => updatePsbt(index, e.target.value)}
                placeholder="Enter PSBT Hex"
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Space>

            {index < psbts.length - 1 && (
              <Divider style={{ margin: '15px 0' }} />
            )}
          </div>
        ))}

        <Button
          type="dashed"
          onClick={addPsbt}
          style={{ width: '100%', marginTop: 10 }}
          icon={<PlusOutlined />}
        >
          Add PSBT
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
          <div style={{ fontWeight: 'bold' }}>Results:</div>
          {results.map((result, index) => (
            <div
              key={index}
              style={{ wordWrap: 'break-word', marginBottom: 10 }}
            >
              <div>
                <b>PSBT {index + 1}:</b>
              </div>
              <div>{result}</div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="primary"
        style={{ marginTop: 10 }}
        onClick={handleSignPsbts}
        loading={loading}
        disabled={psbts.some((psbt) => !psbt.psbtHex)}
        block
      >
        Sign All PSBTs
      </Button>
    </Card>
  );
}
