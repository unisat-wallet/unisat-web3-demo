import { formatDemoError } from './useDemoExecution';

test('formats structured provider errors without losing their details', () => {
  expect(formatDemoError({ code: 4001, message: 'User rejected the request' })).toBe(
    '{\n  "code": 4001,\n  "message": "User rejected the request"\n}'
  );
});

test('formats errors with enumerable provider metadata', () => {
  const error = Object.assign(new Error('Invalid RGB invoice'), { code: 'INVALID_INVOICE' });

  expect(formatDemoError(error)).toContain('Invalid RGB invoice');
  expect(formatDemoError(error)).toContain('INVALID_INVOICE');
});

test('formats errors with circular causes without losing metadata', () => {
  const error = Object.assign(new Error('Provider request failed'), { code: 4001 });
  error.cause = error;

  expect(formatDemoError(error)).toContain('Provider request failed');
  expect(formatDemoError(error)).toContain('"code": 4001');
  expect(formatDemoError(error)).toContain('"cause": "[Circular]"');
});
