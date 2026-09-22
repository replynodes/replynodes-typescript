#!/usr/bin/env node

/**
 * Verify that the stable wrapper exposes every canonical GET operation.
 *
 * This is a build-time verification check, not a test. It reads the vendored
 * contract and the compiled public wrapper, and never makes an HTTP request.
 */
const fs = require('node:fs');
const path = require('node:path');

const sdkDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(sdkDir, '..');
const specPath = path.join(repoRoot, 'openapi', 'replynodes-fetcher.openapi.json');
const compiledWrapperPath = path.join(sdkDir, 'dist', 'cjs', 'src', 'index.js');

function sorted(values) {
  return [...values].sort();
}

function describeDifference(label, expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const missing = sorted(expected.filter((value) => !actualSet.has(value)));
  const unexpected = sorted(actual.filter((value) => !expectedSet.has(value)));
  if (missing.length === 0 && unexpected.length === 0) return null;

  const lines = [`${label} drift detected.`];
  if (missing.length > 0) lines.push(`Missing: ${missing.join(', ')}`);
  if (unexpected.length > 0) lines.push(`Unexpected: ${unexpected.join(', ')}`);
  return lines.join('\n');
}

function fail(message) {
  process.stderr.write(`Surface coverage check failed: ${message}\n`);
  process.exitCode = 1;
}

let spec;
try {
  spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
} catch (error) {
  fail(`unable to read canonical OpenAPI at ${specPath}: ${error.message}`);
  process.exit(1);
}

let wrapper;
try {
  wrapper = require(compiledWrapperPath);
} catch (error) {
  fail(`unable to load compiled wrapper at ${compiledWrapperPath}; run npm run build first: ${error.message}`);
  process.exit(1);
}

const canonicalOperationIds = Object.values(spec.paths ?? {})
  .map((pathItem) => pathItem.get?.operationId)
  .filter(Boolean);
const registry = wrapper.PUBLIC_OPERATION_REGISTRY;
if (!registry || typeof registry !== 'object') {
  fail('compiled wrapper does not export PUBLIC_OPERATION_REGISTRY');
  process.exit(1);
}

const entries = Object.entries(registry).flatMap(([resource, methods]) =>
  Object.entries(methods).map(([method, operationId]) => ({ resource, method, operationId })));
const registryOperationIds = entries.map(({ operationId }) => operationId);
const operationIdDrift = describeDifference(
  'Canonical operation IDs and public registry',
  sorted(canonicalOperationIds),
  sorted([...new Set(registryOperationIds)]),
);
if (operationIdDrift) {
  fail(operationIdDrift);
  process.exit(1);
}

const duplicateOperationIds = sorted(registryOperationIds.filter((operationId, index) => registryOperationIds.indexOf(operationId) !== index));
if (duplicateOperationIds.some((operationId) => operationId !== 'googleSearch')) {
  fail(`registry contains unexpected duplicate operation IDs: ${[...new Set(duplicateOperationIds)].join(', ')}`);
  process.exit(1);
}

let client;
try {
  client = wrapper.ReplyNodes({ apiKey: 'placeholder', baseUrl: 'https://test.invalid' });
} catch (error) {
  fail(`could not instantiate the wrapper: ${error.message}`);
  process.exit(1);
}

const missingMethods = entries
  .filter(({ resource, method }) => typeof client[resource]?.[method] !== 'function')
  .map(({ resource, method, operationId }) => `${resource}.${method} (${operationId})`);
if (missingMethods.length > 0) {
  fail(`registry methods are not callable:\n${missingMethods.join('\n')}`);
  process.exit(1);
}

if (client.web?.search !== client.google?.search) {
  fail('web.search and google.search are not the same compatibility alias');
  process.exit(1);
}

process.stdout.write(`Surface coverage OK: ${canonicalOperationIds.length}/${canonicalOperationIds.length} canonical GET operations; ${entries.length} registry entries.\n`);
