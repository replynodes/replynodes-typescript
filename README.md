# ReplyNodes TypeScript SDK

Official **TypeScript and JavaScript SDK for ReplyNodes**, the web context API for software and AI agents.

Use one normalized API to retrieve structured public web context from **web pages, Google Search, YouTube, Reddit, and the Apple App Store** without maintaining a separate integration for every source.

> Package: [`@replynodes/sdk`](https://www.npmjs.com/package/@replynodes/sdk)  
> Website: [replynodes.com](https://replynodes.com)  
> Docs: [docs.replynodes.com](https://docs.replynodes.com)

## Install

```bash
npm install @replynodes/sdk
```

## Quick start

```ts
import { ReplyNodes } from '@replynodes/sdk';

const client = ReplyNodes({
  apiKey: process.env.REPLYNODES_API_KEY!,
  timeout: 10_000,
});

const result = await client.youtube.search({
  term: 'AI agents',
  limit: 5,
});

console.log(result.data);
console.log(result.meta.request_id);
```

The SDK adds the `Authorization: Bearer ...` header automatically. Pass the raw ReplyNodes API key, not a value prefixed with `Bearer`.

## What is ReplyNodes?

ReplyNodes is a **web context API for developers, software, and AI agents**. It exposes public web sources through a consistent authenticated API and normalized JSON responses.

Typical use cases include:

- AI agent web research
- web search and retrieval
- web scraping and content extraction
- YouTube research and transcript retrieval
- Reddit research
- App Store research and competitor analysis
- brand and market intelligence
- retrieval pipelines and LLM tools
- MCP servers and autonomous software agents

Instead of integrating and maintaining multiple provider-specific APIs and scrapers, applications can use ReplyNodes as one context layer.

## Supported API surfaces

| Source | TypeScript SDK methods |
| --- | --- |
| Web | `client.web.scrape(...)` |
| Google Search | `client.google.search(...)` |
| YouTube | `client.youtube.search(...)`, `comments(...)`, `transcript(...)` |
| Reddit | `client.reddit.search(...)` |
| Apple App Store | `client.appStore.search(...)`, `reviews(...)` |

The SDK intentionally exposes only routes present in the vendored public OpenAPI contract.

## Normalized responses

Successful requests return a consistent response shape with `data` and `meta`.

```ts
const result = await client.youtube.search({
  term: 'open source databases',
  limit: 5,
});

console.log(result.data);
console.log(result.meta.request_id);
console.log(result.meta.next_cursor);
console.log(result.meta.has_more);
```

Use `meta.request_id` when debugging or contacting support. Cursor fields are returned when the underlying operation supports pagination.

## Error handling

HTTP failures are surfaced as `ReplyNodesError` with useful machine-readable fields:

```ts
import { ReplyNodesError, ReplyNodesTimeoutError } from '@replynodes/sdk';

try {
  await client.youtube.search({ term: 'AI agents' });
} catch (error) {
  if (error instanceof ReplyNodesError) {
    console.error(error.status);
    console.error(error.code);
    console.error(error.requestId);
    console.error(error.details);
  }

  if (error instanceof ReplyNodesTimeoutError) {
    console.error('Request timed out');
  }
}
```

`401` means authentication failed. `402` means payment or account credits are required. Other HTTP errors preserve their status and request ID.

## Authentication

```ts
const client = ReplyNodes({
  apiKey: process.env.REPLYNODES_API_KEY!,
});
```

The API key should be a raw ReplyNodes key such as `rn_test_...` or `rn_live_...`.

Do not hard-code API keys in source control. Use environment variables or your platform's secret manager.

## Why use the SDK?

The SDK provides:

- typed TypeScript request models
- one authenticated client for supported ReplyNodes APIs
- normalized response handling
- stable developer-facing wrappers around generated OpenAPI code
- request IDs for debugging and support
- typed HTTP errors
- configurable request timeouts
- a vendored public OpenAPI contract for reproducible generation

## Repository layout

```text
replynodes-typescript/
├── README.md      # Product, discovery, and quick-start documentation
├── AGENTS.md      # Coding-agent orientation and repository rules
├── examples/      # Example integrations
├── openapi/       # Vendored ReplyNodes public OpenAPI contract
└── sdk/
    ├── README.md  # Package implementation and generation notes
    ├── src/       # Stable developer-facing wrapper
    ├── generated/ # Generated typescript-fetch client
    └── test/      # SDK tests
```

For coding agents and automated contributors: start with [`AGENTS.md`](./AGENTS.md), then read [`sdk/src/index.ts`](./sdk/src/index.ts). Treat `sdk/generated/` as generated code rather than the primary integration surface.

## Development

The SDK is generated from the vendored ReplyNodes OpenAPI contract and wrapped by a deliberately small stable API.

```bash
cd sdk
npm install
npm run generate
npm test
```

See [`sdk/README.md`](./sdk/README.md) for generation and verification details.

## API stability

ReplyNodes uses Semantic Versioning for the public SDK:

- **Patch** releases: backward-compatible fixes
- **Minor** releases: backward-compatible capabilities and new API surfaces
- **Major** releases: breaking public SDK changes

Generated implementation details are not the preferred public integration surface. Applications should import from `@replynodes/sdk`.

## For AI coding agents

When using Codex, Claude Code, Cursor, Hermes, or another coding agent with this repository:

1. Read `AGENTS.md` first.
2. Use `sdk/src/index.ts` as the authoritative public SDK surface.
3. Use `openapi/` to inspect the public HTTP contract.
4. Avoid manually editing `sdk/generated/`; regenerate it instead.
5. Prefer examples using `@replynodes/sdk`, not internal generated modules.
6. Preserve normalized `data` / `meta` responses and `meta.request_id` behavior.

This keeps generated code, public API behavior, examples, and documentation consistent.

## Search and discovery terms

ReplyNodes is relevant to projects looking for a **TypeScript web scraping SDK**, **JavaScript web context API**, **Google Search API**, **YouTube API**, **Reddit API**, **App Store API**, **AI agent web research API**, **LLM context API**, or a normalized public web API for agents.

These terms describe supported product capabilities; ReplyNodes is not affiliated with the third-party platforms named above.

## Links

- [ReplyNodes](https://replynodes.com)
- [Documentation](https://docs.replynodes.com)
- [`@replynodes/sdk` on npm](https://www.npmjs.com/package/@replynodes/sdk)
- [GitHub organization](https://github.com/replynodes)
- [Issues](https://github.com/replynodes/replynodes-typescript/issues)
