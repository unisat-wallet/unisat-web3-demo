import { Card, Alert, Spin, Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { DemoConfig, DemoResult } from '../types';

interface DemoCardProps {
  config: DemoConfig;
  result?: DemoResult;
  children: React.ReactNode;
  extra?: React.ReactNode;
}

/**
 * Base card component for all demos
 * Handles common UI patterns: docs link, result display, loading state
 */
export function DemoCard({ config, result, children, extra }: DemoCardProps) {
  return (
    <Card
      className="demo-card"
      title={
        <div className="demo-card-heading">
          <span className="eyebrow">REQUEST</span>
          <code>{config.apiMethod || config.title}</code>
        </div>
      }
      extra={extra}
    >
      <div className="demo-card-meta">
        {config.walletConnectSupported && (
          <span className="wallet-connect-note">
            <Tag color="blue">WalletConnect supported</Tag>
            <Tooltip
              title={
                <span>
                  This API can be called through a WalletConnect session with a compatible external wallet. It does not indicate that a wallet is currently connected.{' '}
                  <a
                    className="wallet-connect-doc-link"
                    href="https://github.com/unisat-wallet/wallet-toolkit/tree/main/packages/wallet-connect-react#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View the WalletConnect React library ↗
                  </a>
                </span>
              }
            >
              <button className="info-tooltip" type="button" aria-label="About WalletConnect support">
                <QuestionCircleOutlined />
              </button>
            </Tooltip>
          </span>
        )}
        {config.docUrl && <a href={config.docUrl} target="_blank" rel="noopener noreferrer">Open API docs ↗</a>}
      </div>

      <div className="demo-card-form">{children}</div>

      <DemoResultDisplay result={result} />
    </Card>
  );
}

interface DemoResultDisplayProps {
  result?: DemoResult;
}

function DemoResultDisplay({ result }: DemoResultDisplayProps) {
  if (!result || result.status === 'idle') {
    return null;
  }

  if (result.status === 'loading') {
    return (
      <div className="demo-result-loading">
        <Spin size="small" />
        <span>Requesting wallet approval…</span>
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <Alert
        type="error"
        message="Request failed"
        description={result.error}
        className="demo-result"
      />
    );
  }

  if (result.status === 'success') {
    return (
      <Alert
        type="success"
        message="Request completed"
        description={
          <pre className="demo-result-data">
            {result.data}
          </pre>
        }
        className="demo-result"
      />
    );
  }

  return null;
}

/**
 * Form field wrapper for consistent styling
 */
export function DemoField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="demo-field">
      <div className="demo-field-label">{label}</div>
      {children}
    </div>
  );
}
