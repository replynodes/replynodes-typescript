# @replynodes/sdk 0.3.0

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

The repository-level `examples/quickstart.js`, `examples/quickstart.ts`, `examples/web-search.mjs`, and `examples/brand-info.mjs` are runnable documentation; they are not included in the published package and are outside the SDK build.

Available methods are `youtube.search`, `youtube.comments`, `youtube.transcript`, `reddit.search`, `web.brand`, `web.scrape`, `web.search`, `google.search` (backward-compatible alias for `web.search`), `appStore.search`, and `appStore.reviews`. `googleNews` is not exposed because the vendored contract has no Google News route. Responses contain normalized `data` and `meta`; use `meta.request_id` for support and `meta.next_cursor`/`meta.has_more` when returned by an operation. The SDK does not automatically paginate or retry requests.

Errors are `ReplyNodesError` with `status`, `code`, `requestId`, and parsed `details`. `401` means authentication failed; `402` means payment or account credits are required; other HTTP errors retain their status and request ID. A client-side deadline throws `ReplyNodesTimeoutError`. Set `timeout` in milliseconds; omit it to use the platform fetch behavior.

Request IDs are backend-owned. Successful responses expose `meta.request_id` exactly when the backend supplies it; the SDK never invents one. For errors, `requestId` uses `error.request_id`, then the `x-request-id` response header. Include that value when reporting a failure. The current OpenAPI schema marks success `meta.request_id` as required, while the backend may omit it; until the schema is corrected, consumers should treat it as possibly absent at runtime.

## Versioning and boundaries

The SDK follows SemVer: patch releases contain backwards-compatible fixes, minor releases add backwards-compatible APIs, and major releases may change or remove public behavior. `@replynodes/sdk` is the typed REST client for direct API calls. `@replynodes/mcp` is a separate agent bridge with MCP tools and lifecycle concerns; it is not a layer of this SDK and the two packages are versioned and operated independently.

To transfer or manage this package under the official ReplyNodes npm organization/account, an npm owner with access should run:

```sh
npm owner add replynodes @replynodes/sdk
npm owner ls @replynodes/sdk
npm dist-tag ls @replynodes/sdk
```

From a clean environment, verify the published package with `npm pack @replynodes/sdk@latest`, inspect the tarball, install it in a fresh temporary project, and run both `node -e "const sdk=require('@replynodes/sdk'); console.log(typeof sdk.ReplyNodes)"` and an ESM import/default plus TypeScript declaration check. The release manager should confirm the maintainers and `latest` dist-tag before publishing.

## Local generation and verification

The canonical, vendored input is `../openapi/replynodes-fetcher.openapi.json`. Its SHA-256 is `6f403c37eea6561e500f6292f435fbc2a544152415ea0c17f0c6ed4e58281b46`.

Generation is pinned to OpenAPI Generator `v7.10.0`:

```sh
npm run generate
npm test
```

`npm run generate` uses the official Docker image and `openapi-generator-config.json`; it writes only to `generated/`. The generated client contains the public SDK contract only.
