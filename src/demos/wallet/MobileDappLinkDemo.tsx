import { useState } from 'react';
import { Alert, Button, Input, message } from 'antd';
import QRCode from 'qrcode';
import { copyToClipboard } from '../../utils';
import { DemoCard, DemoField } from '../components/DemoCard';
import type { DemoConfig } from '../types';

const UNISAT_MOBILE_REQUEST_URL = 'https://app.unisat.cloud/request';

export const mobileDappLinkConfig: DemoConfig = {
  key: 'mobileDappLink',
  title: 'Mobile DApp Link',
  category: 'wallet',
  apiMethod: 'openDapp Universal Link',
  description: 'Generate an Open in UniSat link and QR code for an HTTPS dApp URL.',
  walletConnectSupported: false,
};

export function createUniSatMobileLink(dappUrl: string) {
  let url: URL;

  try {
    url = new URL(dappUrl.trim());
  } catch {
    throw new Error('Enter a valid HTTPS URL.');
  }

  if (url.protocol !== 'https:') {
    throw new Error('The dApp URL must use HTTPS.');
  }

  if (url.username || url.password) {
    throw new Error('The dApp URL must not contain credentials.');
  }

  const requestUrl = new URL(UNISAT_MOBILE_REQUEST_URL);
  requestUrl.searchParams.set('method', 'openDapp');
  requestUrl.searchParams.set('from', 'browser');
  requestUrl.searchParams.set('data', btoa(JSON.stringify([url.toString()])));
  return requestUrl.toString();
}

export function MobileDappLinkDemo() {
  const [dappUrl, setDappUrl] = useState('');
  const [mobileLink, setMobileLink] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleGenerate = async () => {
    setError('');
    setMobileLink('');
    setQrCode('');
    setIsGenerating(true);

    try {
      const nextLink = createUniSatMobileLink(dappUrl);
      const nextQrCode = await QRCode.toDataURL(nextLink, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 280,
      });
      setMobileLink(nextLink);
      setQrCode(nextQrCode);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to generate the link.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(mobileLink);
      messageApi.success('Mobile link copied.');
    } catch {
      messageApi.error('Unable to copy the link.');
    }
  };

  return (
    <DemoCard config={mobileDappLinkConfig}>
      {contextHolder}
      <Alert
        type="info"
        showIcon
        message="Open the dApp inside UniSat Mobile"
        description="The generated Universal Link opens UniSat Mobile and loads the supplied page in its in-app browser. The page must use HTTPS."
      />

      <DemoField label="DApp URL">
        <Input
          value={dappUrl}
          onChange={(event) => setDappUrl(event.target.value)}
          onPressEnter={() => void handleGenerate()}
          placeholder="https://example.com/rgb-test"
          inputMode="url"
          autoCapitalize="none"
          spellCheck={false}
        />
      </DemoField>

      <Button
        type="primary"
        loading={isGenerating}
        disabled={!dappUrl.trim()}
        onClick={() => void handleGenerate()}
        block
      >
        Generate link and QR code
      </Button>

      {error && <Alert className="mobile-link-error" type="error" showIcon message={error} />}

      {mobileLink && qrCode && (
        <section className="mobile-link-result" aria-label="Generated UniSat Mobile link">
          <div className="mobile-link-qr">
            <img src={qrCode} alt="QR code for opening the dApp in UniSat Mobile" />
            <span>Scan with a phone that has UniSat Mobile installed</span>
          </div>

          <div className="mobile-link-details">
            <DemoField label="UniSat Mobile Universal Link">
              <Input.TextArea value={mobileLink} readOnly autoSize={{ minRows: 4, maxRows: 7 }} />
            </DemoField>
            <div className="mobile-link-actions">
              <Button onClick={() => void handleCopy()}>Copy link</Button>
              <Button type="primary" href={mobileLink} target="_blank">
                Open in UniSat
              </Button>
            </div>
          </div>
        </section>
      )}
    </DemoCard>
  );
}
