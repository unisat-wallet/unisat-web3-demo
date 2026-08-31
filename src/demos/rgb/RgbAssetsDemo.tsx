import { useState } from 'react';
import { Alert, Button, InputNumber, Table, Tag } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { getUnisat, useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

type RgbAsset = {
  assetId: string;
  ticker?: string;
  name?: string;
  precision?: number;
  balance?: string;
  spendable?: string;
  settled?: string;
};

export const rgbAssetsConfig: DemoConfig = {
  key: 'getRgbAssets',
  title: 'RGB Assets',
  category: 'rgb',
  apiMethod: 'unisat.getRgbAssets',
  description: 'Read the wallet’s local RGB asset balances. This experimental API does not open a wallet approval.',
};

export function RgbAssetsDemo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [assets, setAssets] = useState<RgbAsset[]>([]);
  const [total, setTotal] = useState<number>();
  const { result, execute, isLoading } = useDemoExecution();

  const loadAssets = async () => {
    try {
      await execute(async () => {
        const response = await getUnisat().getRgbAssets(page, pageSize);
        setAssets(response?.list || []);
        setTotal(response?.total);
        return response;
      }, (data) => JSON.stringify(data, null, 2));
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  return (
    <DemoCard config={rgbAssetsConfig} result={result}>
      <Alert
        type="info"
        showIcon
        message="Experimental RGB API"
        description="Balances are read from the wallet’s local RGB state. Open the receive or payment API to create a transfer workflow."
      />
      <DemoField label="Pagination">
        <div className="rgb-inline-fields">
          <label>Page<InputNumber value={page} min={1} onChange={(value) => setPage(value || 1)} /></label>
          <label>Page size<InputNumber value={pageSize} min={1} max={100} onChange={(value) => setPageSize(value || 50)} /></label>
          <Button type="primary" loading={isLoading} onClick={() => void loadAssets()}>Load assets</Button>
        </div>
      </DemoField>
      <DemoField label={total === undefined ? 'Asset list' : `Asset list · ${total} total`}>
        <Table
          size="small"
          rowKey="assetId"
          pagination={false}
          locale={{ emptyText: 'Load assets to inspect the wallet’s RGB balances.' }}
          dataSource={assets}
          columns={[
            { title: 'Asset', render: (_: unknown, item: RgbAsset) => <strong>{item.ticker || item.name || 'Unknown asset'}</strong> },
            { title: 'Spendable', render: (_: unknown, item: RgbAsset) => item.spendable ?? item.balance ?? '0' },
            { title: 'Precision', dataIndex: 'precision', render: (value: number | undefined) => value ?? '—' },
            { title: 'Asset ID', dataIndex: 'assetId', ellipsis: true, render: (value: string) => <Tag>{value}</Tag> },
          ]}
        />
      </DemoField>
    </DemoCard>
  );
}
