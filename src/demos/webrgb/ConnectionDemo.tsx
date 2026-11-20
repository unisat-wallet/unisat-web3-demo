import { Alert, Button, Select, Space, Tag } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';
import { useWebRgbProvider } from './provider';

export const webRgbConnectionConfig: DemoConfig = {
  key: 'webRgbConnection',
  title: 'Provider & Connection',
  category: 'webrgb',
  apiMethod: 'rgb.enable / getInfo / getAddress',
  docUrl: 'https://api-docs.unisat.io/docs/wallet-api/webrgb#connect-and-feature-detect',
  description: 'Discover a WebRGB v1 wallet, connect it and inspect its supported capabilities.',
};

export function WebRgbConnectionDemo() {
  const {
    provider,
    providerName,
    providers,
    selectedProviderId,
    selectProvider,
    enabled,
    setEnabled,
  } = useWebRgbProvider();
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
      <Alert type="info" showIcon message="WebRGB v1 discovery" description="The demo validates announced providers and requires an explicit wallet choice when multiple providers are discovered." />
      <DemoField label="Discovered provider">
        <Space wrap>
          <Select
            value={selectedProviderId || undefined}
            placeholder={providers.length > 1 ? 'Choose a WebRGB wallet' : 'Discovering wallets...'}
            style={{ minWidth: 240 }}
            options={providers.map((option) => ({
              value: option.id,
              label: option.rdns ? `${option.name} (${option.rdns})` : option.name,
            }))}
            onChange={selectProvider}
          />
          <Tag color={provider ? 'green' : 'default'}>{provider ? providerName : 'No provider found'}</Tag>
          <Tag color={enabled ? 'processing' : 'default'}>{enabled ? 'Enabled' : 'Not enabled'}</Tag>
        </Space>
      </DemoField>
      {providers.length > 1 && !provider && (
        <Alert type="warning" showIcon message="Multiple WebRGB wallets were found. Choose the wallet you intend to use before continuing." />
      )}
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
