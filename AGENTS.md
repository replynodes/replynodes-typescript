# AGENTS.md — ReplyNodes TypeScript SDK

This file is the fast orientation guide for AI coding agents working in this repository.

## Purpose

This repository contains the official TypeScript/JavaScript SDK for the ReplyNodes public read API.

ReplyNodes provides normalized public web context for software and AI agents. Current SDK surfaces include Web, Google Search, YouTube, Reddit, and Apple App Store APIs.

## Read these files first

1. `README.md` — product context, quick start, supported public SDK surface.
2. `sdk/src/index.ts` — authoritative developer-facing TypeScript wrapper.
3. `sdk/README.md` — package generation, testing, and implementation notes.
4. `openapi/` — vendored public OpenAPI contract used to generate the low-level client.

## Source of truth

- Public developer-facing API: `sdk/src/index.ts`
- HTTP contract: `openapi/`
- Generated client: `sdk/generated/`

Do not treat generated files as the primary SDK API.

## Generated code rule

Do not manually edit `sdk/generated/` unless the task explicitly requires investigating generated output.

When the OpenAPI contract changes, regenerate the client using the SDK generation workflow.

```bash
cd sdk
npm run generate
npm test
```

## Public SDK conventions

Preserve these behaviors unless the task explicitly changes the public contract:

- users instantiate the SDK with `ReplyNodes({ apiKey, baseUrl?, timeout? })`
- API keys are raw values; the SDK adds the Bearer authorization header
- successful responses expose normalized `data` and `meta`
- `meta.request_id` is retained for debugging/support
- pagination metadata may include `meta.next_cursor` and `meta.has_more`
- HTTP failures are surfaced as `ReplyNodesError`
- request deadlines are surfaced as `ReplyNodesTimeoutError`

## Current public methods

```text
client.youtube.search(...)
client.youtube.comments(...)
client.youtube.transcript(...)
client.reddit.search(...)
client.web.scrape(...)
client.google.search(...)
client.appStore.search(...)
client.appStore.reviews(...)
```

Do not document or expose a provider that is not present in the public contract.

## Documentation rules

When adding or changing a public SDK method:

1. update the public OpenAPI contract when applicable
2. regenerate generated code
3. update the stable wrapper in `sdk/src/`
4. add or update tests
5. update `sdk/README.md` for package-specific behavior
6. update root `README.md` when discovery, supported providers, installation, or quick-start behavior changes

Examples should import from `@replynodes/sdk`, not from `sdk/generated/`.

## Agent efficiency

Avoid scanning the entire generated client before understanding the task. Start from `sdk/src/index.ts` and only inspect generated files or OpenAPI operations relevant to the requested method.

Prefer small, explicit changes to the stable wrapper over exposing the full generated client surface.

## Validation

Before completing SDK changes, run:

```bash
cd sdk
npm test
```

If generation inputs changed, run:

```bash
cd sdk
npm run generate
npm test
```
