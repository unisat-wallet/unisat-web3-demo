import { useEffect, useState } from 'react';
import { Alert, Button, Space, Tag } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { getUnisat } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

type WalletEvent = {
  event: 'accountsChanged' | 'chainChanged';
  payload: unknown;
  receivedAt: string;
};

export const walletEventsConfig: DemoConfig = {
  key: 'walletEvents',
  title: 'Wallet Events',
  category: 'wallet',
  apiMethod: 'unisat.on / removeListener',
  docUrl: 'https://api-docs.unisat.io/docs/wallet-api/access-accounts#accountschanged',
  description: 'Subscribe to account and chain changes emitted by UniSat Wallet.',
};

export function WalletEventsDemo() {
  const [subscribed, setSubscribed] = useState(false);
  const [events, setEvents] = useState<WalletEvent[]>([]);
  const [subscriptionError, setSubscriptionError] = useState('');

  useEffect(() => {
    if (!subscribed) return;

    let unisat: any;
    const append = (event: WalletEvent['event'], payload: unknown) => {
      setEvents((current) => [{ event, payload, receivedAt: new Date().toISOString() }, ...current].slice(0, 20));
    };
    const accountsChanged = (accounts: unknown) => append('accountsChanged', accounts);
    const chainChanged = (chain: unknown) => append('chainChanged', chain);

    try {
      unisat = getUnisat();
      unisat.on('accountsChanged', accountsChanged);
      unisat.on('chainChanged', chainChanged);
      setSubscriptionError('');
    } catch (error) {
      setSubscriptionError(error instanceof Error ? error.message : String(error));
      setSubscribed(false);
    }

    return () => {
      unisat?.removeListener('accountsChanged', accountsChanged);
      unisat?.removeListener('chainChanged', chainChanged);
    };
  }, [subscribed]);

  return (
    <DemoCard config={walletEventsConfig}>
      <Alert
        type="info"
        showIcon
        message="Live provider events"
        description="Keep this page open while switching the account or chain in UniSat Wallet. The newest 20 events are retained."
      />
      {subscriptionError && <Alert className="rgb-inline-alert" type="error" showIcon message="Subscription failed" description={subscriptionError} />}
      <DemoField label="Event subscription">
        <Space wrap>
          <Button disabled={subscribed} onClick={() => setSubscribed(true)}>Start listening</Button>
          <Button disabled={!subscribed} onClick={() => setSubscribed(false)}>Stop listening</Button>
          <Button disabled={!events.length} onClick={() => setEvents([])}>Clear events</Button>
          <Tag color={subscribed ? 'processing' : 'default'}>{subscribed ? 'Listening' : 'Stopped'}</Tag>
        </Space>
      </DemoField>
      <DemoField label={`Received events · ${events.length}`}>
        <pre className="demo-result-data">{events.length ? JSON.stringify(events, null, 2) : 'No events received.'}</pre>
      </DemoField>
    </DemoCard>
  );
}
