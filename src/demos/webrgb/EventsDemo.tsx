import { useEffect, useState } from 'react';
import { Alert, Button, Space, Tag } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import type { DemoConfig } from '../types';
import { useWebRgbProvider } from './provider';

export const webRgbEventsConfig: DemoConfig = {
  key: 'webRgbEvents',
  title: 'Transfer Events',
  category: 'webrgb',
  apiMethod: 'rgb.on / off',
  description: 'Subscribe to WebRGB transferReceived and transferSettled events.',
};

export function WebRgbEventsDemo() {
  const [subscribed, setSubscribed] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [subscriptionError, setSubscriptionError] = useState('');
  const { provider, enabled } = useWebRgbProvider();

  useEffect(() => {
    if (!provider || !subscribed) return;
    const received = (transfer: any) => setEvents((current) => [{ event: 'transferReceived', transfer }, ...current].slice(0, 20));
    const settled = (transfer: any) => setEvents((current) => [{ event: 'transferSettled', transfer }, ...current].slice(0, 20));
    try {
      provider.on('transferReceived', received);
      provider.on('transferSettled', settled);
      setSubscriptionError('');
    } catch (error) {
      setSubscriptionError(error instanceof Error ? error.message : String(error));
      setSubscribed(false);
    }
    return () => {
      try {
        provider.off('transferReceived', received);
        provider.off('transferSettled', settled);
      } catch {
        // The provider may have disconnected before cleanup.
      }
    };
  }, [provider, subscribed]);

  return (
    <DemoCard config={webRgbEventsConfig}>
      <Alert type="info" showIcon message="Provider-backed polling" description="The current UniSat WebRGB adapter checks transfers every 15 seconds while at least one event listener is registered." />
      {!enabled && <Alert className="rgb-inline-alert" type="warning" showIcon message="Enable WebRGB in Provider & Connection first" />}
      {subscriptionError && <Alert className="rgb-inline-alert" type="error" showIcon message="Subscription failed" description={subscriptionError} />}
      <DemoField label="Event subscription">
        <Space wrap>
          <Button type={subscribed ? 'default' : 'primary'} disabled={!enabled} onClick={() => setSubscribed((value) => !value)}>{subscribed ? 'Stop listening' : 'Listen for events'}</Button>
          {subscribed && <Tag color="processing">Listening</Tag>}
          <Button disabled={!events.length} onClick={() => setEvents([])}>Clear events</Button>
        </Space>
      </DemoField>
      <DemoField label={`Received events · ${events.length}`}>
        <pre className="demo-result-data">{events.length ? JSON.stringify(events, null, 2) : 'No events received.'}</pre>
      </DemoField>
    </DemoCard>
  );
}
