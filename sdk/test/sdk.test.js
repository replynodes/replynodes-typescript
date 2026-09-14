const test = require('node:test');
const assert = require('node:assert/strict');
const { ReplyNodes, ReplyNodesError, ReplyNodesTimeoutError } = require('../dist/cjs/src');

test('uses bearer auth and exposes intentional methods', async () => {
  const calls = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({ data: [{ title: 'ok' }], meta: { request_id: 'req_test' } }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const client = ReplyNodes({ apiKey: 'rn_test_never_sent', baseUrl: 'https://test.invalid' });
    assert.equal(typeof client.youtube.search, 'function');
    assert.equal(client.googleNews, undefined);
    const result = await client.youtube.search({ term: 'test' });
    assert.equal(result.meta.request_id, 'req_test');
    assert.equal(calls[0].url, 'https://test.invalid/v1/youtube/search?term=test');
    assert.equal(calls[0].init.headers.Authorization, 'Bearer rn_test_never_sent');
  } finally { global.fetch = originalFetch; }
});

test('accepts the official API and explicitly allowed local/test origins', () => {
  for (const baseUrl of [
    'https://api.replynodes.com',
    'https://api.replynodes.com/v1',
    'http://localhost:8787',
    'https://test.invalid',
  ]) {
    assert.doesNotThrow(() => ReplyNodes({ apiKey: 'key', baseUrl }));
  }
});

test('rejects untrusted baseUrl values before sending the bearer key', async () => {
  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = async () => { calls++; return new Response('{}'); };
  try {
    for (const baseUrl of ['not-a-url', 'https://attacker.invalid', 'http://api.replynodes.com', 'https://api.replynodes.com.evil']) {
      assert.throws(() => ReplyNodes({ apiKey: 'rn_secret', baseUrl }), /baseUrl/);
    }
    assert.equal(calls, 0);
  } finally { global.fetch = originalFetch; }
});

test('preserves the missing success request ID contract without synthesizing one', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ data: [], meta: {} }), { status: 200, headers: { 'content-type': 'application/json' } });
  try {
    const result = await ReplyNodes({ apiKey: 'key' }).web.scrape({ url: 'https://example.com' });
    assert.equal(result.meta.request_id, undefined);
  } finally { global.fetch = originalFetch; }
});

test('maps API errors with request id and never retries', async () => {
  const originalFetch = global.fetch;
  let count = 0;
  global.fetch = async () => { count++; return new Response(JSON.stringify({ error: { code: 'bad_request', message: 'Nope', request_id: 'req_error' } }), { status: 400, headers: { 'content-type': 'application/json' } }); };
  try {
    await assert.rejects(() => ReplyNodes({ apiKey: 'key' }).reddit.search({ query: 'x' }), (error) => error instanceof ReplyNodesError && error.status === 400 && error.code === 'bad_request' && error.requestId === 'req_error');
    assert.equal(count, 1);
  } finally { global.fetch = originalFetch; }
});

test('falls back to the x-request-id header for errors', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ error: { code: 'bad_request', message: 'Nope' } }), {
    status: 400,
    headers: { 'content-type': 'application/json', 'x-request-id': 'req_header' },
  });
  try {
    await assert.rejects(() => ReplyNodes({ apiKey: 'key' }).reddit.search({ query: 'x' }),
      (error) => error instanceof ReplyNodesError && error.requestId === 'req_header');
  } finally { global.fetch = originalFetch; }
});

test('preserves the documented 402 payment error shape and request ID', async () => {
  const originalFetch = global.fetch;
  const payment = { x402Version: 2, error: 'Payment Required', resource: { url: 'https://api.replynodes.com' }, accepts: [], extensions: {} };
  global.fetch = async () => new Response(JSON.stringify(payment), {
    status: 402,
    headers: { 'content-type': 'application/json', 'x-request-id': 'req_payment' },
  });
  try {
    await assert.rejects(() => ReplyNodes({ apiKey: 'key' }).web.scrape({ url: 'https://example.com' }), (error) => {
      assert.ok(error instanceof ReplyNodesError);
      assert.equal(error.status, 402);
      assert.equal(error.requestId, 'req_payment');
      assert.deepEqual(error.details, payment);
      return true;
    });
  } finally { global.fetch = originalFetch; }
});

test('enforces timeout without retry', async () => {
  const originalFetch = global.fetch;
  global.fetch = async (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted'))));
  try { await assert.rejects(() => ReplyNodes({ apiKey: 'key', timeout: 5 }).web.scrape({ url: 'https://example.com' }), ReplyNodesTimeoutError); }
  finally { global.fetch = originalFetch; }
});
