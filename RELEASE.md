# Release process and npm ownership (issue #460)

This document describes how `@replynodes/sdk` is released, the current npm
ownership state, and the manual admin steps required to finish migrating
publishing to organization-controlled trusted publishing. It intentionally
contains no secrets, tokens, or recovery codes.

## Current state (verified 2026-09-22, public read-only sources only)

- **npm registry readback** (`GET https://registry.npmjs.org/@replynodes/sdk`,
  unauthenticated): `dist-tags.latest` is `0.3.0`; `maintainers` lists exactly
  one account, `dnanh2011`. No organization-controlled second owner is
  currently listed.
- **Source repository**: `repository.url` in the same registry response is
  `git+https://github.com/replynodes/replynodes-typescript.git`, and
  `gh api repos/replynodes/replynodes-typescript` confirms the repository is
  owned by the `replynodes` GitHub organization (not a personal account).
- **GitHub organization admin count**: `gh api orgs/replynodes/memberships/<user>`
  (queried for the org's current members) shows at least two accounts with
  `role: admin` and `state: active`. This satisfies a two-admin recovery model
  at the GitHub/repository level; it does not by itself change npm ownership,
  which is tracked independently by npm.
- **Release automation**: this repository previously had no `.github/workflows`
  directory and no release workflow of any kind. `.github/workflows/npm-publish.yml`
  (added by this change) is the first release workflow.

None of the above required, read, or transmitted any credential.

## What `.github/workflows/npm-publish.yml` does

- Triggers on a published GitHub Release, or manually via
  `workflow_dispatch` with a `confirm_version` input that must match
  `sdk/package.json` (a guard against publishing the wrong version).
- Requests only `contents: read` and `id-token: write` — no other repository
  permissions.
- Runs under the `npm-publish` GitHub Actions environment, so branch/reviewer
  protection rules can be attached to it independently of normal CI.
- Builds, runs `check:surface`, runs the test suite, and does a `npm pack`
  dry run before publishing — the same checks documented in `AGENTS.md`.
- Publishes with `npm publish --provenance --access public` and **no
  `NODE_AUTH_TOKEN` / long-lived npm token anywhere in the workflow**.
  Authentication comes from npm's Trusted Publishing (OIDC) exchange between
  GitHub Actions and the npm registry, which npm CLI `>=11.5.1` performs
  automatically once trusted publishing is configured on the npm side (see
  below). No npm secret needs to be stored in this repository at all.

## Manual npm admin steps required (cannot be done from this environment)

These steps require an interactive login to npmjs.com as an existing owner of
`@replynodes/sdk` (currently only `dnanh2011`, per the registry readback
above). They cannot be completed by an automated coding agent without
credentials, and none were read, requested, or used to produce this change.

1. **Determine whether the `@replynodes` scope is already an npm
   Organization.** Sign in as `dnanh2011` and check
   `https://www.npmjs.com/settings/replynodes/packages`. If that renders an
   organization's package list, the scope is already an npm Organization and
   step 2 can be skipped. If it 404s or redirects to a personal profile, the
   scope is currently tied to the personal account.
2. **If the scope is not yet an npm Organization**, create one at
   `https://www.npmjs.com/org/create` named `replynodes`, then follow npm's
   package-transfer flow (`npm support` ticket at
   <https://www.npmjs.com/support> may be required for an already-published
   scoped package) to move `@replynodes/sdk` under that organization.
3. **Add at least one additional Owner-level member** to the `replynodes` npm
   organization (or, if an org-level transfer is not immediately possible,
   run `npm owner add <second-account> @replynodes/sdk`) so publishing and
   recovery do not depend solely on `dnanh2011`.
4. **Configure Trusted Publishing** at
   `https://www.npmjs.com/package/@replynodes/sdk/access` → "Trusted
   Publisher" → GitHub Actions, with:
   - Organization or user: `replynodes`
   - Repository: `replynodes-typescript`
   - Workflow filename: `npm-publish.yml`
   - Environment: `npm-publish`
5. **Verify with a non-breaking release**: cut a patch release (e.g. a
   changelog-only or metadata-only bump) through the new workflow and confirm
   on `https://www.npmjs.com/package/@replynodes/sdk` that the published
   version shows a provenance/build-attestation badge referencing this
   repository and workflow, then re-run the registry readback command above
   and confirm `maintainers` reflects organization-controlled ownership.
6. **Retire any long-lived personal npm publish token** used by prior manual
   releases once step 5 is confirmed working.

Until step 4 is complete, `.github/workflows/npm-publish.yml` will fail at the
`npm publish` step with an authentication error — that failure is expected
and is not a bug in the workflow; it is the signal that the manual bootstrap
above has not been performed yet.

## Other registries (PyPI, Go, RubyGems, Packagist)

See the cross-registry evidence record in the `replynodes-fetcher` repository
(`docs/sdk-registry-ownership.md`) for the full picture. Summary relevant to
this repository: those SDKs are not yet published, so their trusted-publishing
setup is a pre-publication plan rather than a workflow change, and no code for
them lives in this TypeScript-only repository.
