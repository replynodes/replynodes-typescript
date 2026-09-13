# @replynodes/sdk

One small TypeScript package for the authenticated, public ReplyNodes read API. The generated `typescript-fetch` client is kept under `generated/`; `src/` is the stable, intentionally narrow developer-facing wrapper.

## Install and quickstart

```sh
npm install @replynodes/sdk
```

```js
const { ReplyNodes } = require('@replynodes/sdk');

const client = ReplyNodes({
  apiKey: process.env.REPLYNODES_API_KEY,
  timeout: 10_000,
});

const result = await client.youtube.search({ term: 'open source databases', limit: 5 });
console.log(result.data);
console.log(result.meta.request_id);
```

The API key is the raw `rn_test_...` or `rn_live_...` value. The SDK adds `Authorization: Bearer ...`; do not include the `Bearer ` prefix yourself. `baseUrl` can override the production URL for tests or compatible gateways.

Available methods are `youtube.search`, `youtube.comments`, `youtube.transcript`, `reddit.search`, `web.scrape`, `google.search`, `appStore.search`, and `appStore.reviews`. `googleNews` is not exposed because the vendored contract has no Google News route. Responses contain normalized `data` and `meta`; use `meta.request_id` for support and `meta.next_cursor`/`meta.has_more` when returned by an operation. The SDK does not automatically paginate or retry requests.

Errors are `ReplyNodesError` with `status`, `code`, `requestId`, and parsed `details`. `401` means authentication failed; `402` means payment or account credits are required; other HTTP errors retain their status and request ID. A client-side deadline throws `ReplyNodesTimeoutError`. Set `timeout` in milliseconds; omit it to use the platform fetch behavior.

## Local generation and verification

The canonical, vendored input is `../openapi/replynodes-fetcher.openapi.json`. Its SHA-256 is `6f403c37eea6561e500f6292f435fbc2a544152415ea0c17f0c6ed4e58281b46`.

Generation is pinned to OpenAPI Generator `v7.10.0`:

```sh
npm run generate
npm test
```

`npm run generate` uses the official Docker image and `openapi-generator-config.json`; it writes only to `generated/`. The generated client contains the public SDK contract only.
