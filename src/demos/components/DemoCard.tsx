import { Card, Alert, Spin } from 'antd';
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
      size="small"
      title={config.title}
      style={{ margin: 10 }}
      extra={extra}
    >
      {config.docUrl && (
        <div style={{ textAlign: 'left', marginTop: 10 }}>
          <div style={{ fontWeight: 'bold' }}>Docs:</div>
          <a href={config.docUrl} target="_blank" rel="noopener noreferrer">
            {config.docUrl}
          </a>
        </div>
      )}

      {config.description && (
        <div style={{ textAlign: 'left', marginTop: 10, color: '#666' }}>
          {config.description}
        </div>
      )}

      {children}

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
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Spin size="small" />
        <span style={{ marginLeft: 8 }}>Requesting...</span>
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <Alert
        type="error"
        message="Error"
        description={result.error}
        style={{ marginTop: 16, textAlign: 'left' }}
      />
    );
  }

  if (result.status === 'success') {
    return (
      <Alert
        type="success"
        message="Success"
        description={
          <div style={{ wordWrap: 'break-word', maxHeight: 200, overflow: 'auto' }}>
            {result.data}
          </div>
        }
        style={{ marginTop: 16, textAlign: 'left' }}
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
    <div style={{ textAlign: 'left', marginTop: 10 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{label}:</div>
      {children}
    </div>
  );
}
