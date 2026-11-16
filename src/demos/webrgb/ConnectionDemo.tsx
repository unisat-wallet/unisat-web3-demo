import { Alert, Button, Space, Tag } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';
import { useWebRgbProvider } from './provider';

export const webRgbConnectionConfig: DemoConfig = {
  key: 'webRgbConnection',
  title: 'Provider & Connection',
  category: 'webrgb',
  apiMethod: 'rgb.enable / getInfo / getAddress',
  description: 'Discover a WebRGB v1 wallet, connect it and inspect its supported capabilities.',
};

export function WebRgbConnectionDemo() {
  const { provider, providerName, enabled, setEnabled } = useWebRgbProvider();
  const { result, execute, isLoading } = useDemoExecution();

  const run = async (operation: () => Promise<any>) => {
    try {
      await execute(operation, (data) => JSON.stringify(data ?? { success: true }, null, 2));
    } catch {
      // useDemoExecution has already rendered the request error.
    }
  };

  return (
    <DemoCard config={webRgbConnectionConfig} result={result}>
      <Alert type="info" showIcon message="WebRGB v1 discovery" description="The demo checks window.rgb and dispatches rgb:requestProvider to discover wallets through rgb:announceProvider." />
      <DemoField label="Discovered provider">
        <Space wrap>
          <Tag color={provider ? 'green' : 'default'}>{provider ? providerName : 'No provider found'}</Tag>
          <Tag color={enabled ? 'processing' : 'default'}>{enabled ? 'Enabled' : 'Not enabled'}</Tag>
        </Space>
      </DemoField>
      <DemoField label="Connection interfaces">
        <Space wrap>
          <Button type="primary" loading={isLoading} disabled={!provider} onClick={() => void run(async () => {
            await provider!.enable();
            setEnabled(true);
            return provider!.getInfo();
          })}>Enable WebRGB</Button>
          <Button loading={isLoading} disabled={!provider || !enabled} onClick={() => void run(() => provider!.getInfo())}>Get capabilities</Button>
          <Button loading={isLoading} disabled={!provider || !enabled} onClick={() => void run(() => provider!.getAddress())}>Get RGB address</Button>
        </Space>
      </DemoField>
    </DemoCard>
  );
}
