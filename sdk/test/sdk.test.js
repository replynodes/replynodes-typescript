const test = require('node:test');
const assert = require('node:assert/strict');
const { ReplyNodes, ReplyNodesError, ReplyNodesTimeoutError } = require('../dist/src');

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

test('maps API errors with request id and never retries', async () => {
  const originalFetch = global.fetch;
  let count = 0;
  global.fetch = async () => { count++; return new Response(JSON.stringify({ error: { code: 'bad_request', message: 'Nope', request_id: 'req_error' } }), { status: 400, headers: { 'content-type': 'application/json' } }); };
  try {
    await assert.rejects(() => ReplyNodes({ apiKey: 'key' }).reddit.search({ query: 'x' }), (error) => error instanceof ReplyNodesError && error.status === 400 && error.code === 'bad_request' && error.requestId === 'req_error');
    assert.equal(count, 1);
  } finally { global.fetch = originalFetch; }
});

test('enforces timeout without retry', async () => {
  const originalFetch = global.fetch;
  global.fetch = async (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted'))));
  try { await assert.rejects(() => ReplyNodes({ apiKey: 'key', timeout: 5 }).web.scrape({ url: 'https://example.com' }), ReplyNodesTimeoutError); }
  finally { global.fetch = originalFetch; }
});
