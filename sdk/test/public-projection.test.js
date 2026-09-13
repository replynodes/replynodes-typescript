const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const sdkDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(sdkDir, '..');
const canonicalPath = path.join(repoRoot, 'openapi/replynodes-fetcher.openapi.json');
const projectedPath = path.join(sdkDir, '.generated/replynodes-fetcher.public.openapi.json');
const forbidden = [/webclaw-server/i, /raw provider/i, /\bprovider\b/i, /\/v1\/billing\/topup\/intents/i];

function project() {
  execFileSync(process.execPath, ['scripts/project-public-openapi.js'], { cwd: sdkDir, stdio: 'pipe' });
}

test('canonical OpenAPI provenance SHA is unchanged', () => {
  const sha = crypto.createHash('sha256').update(fs.readFileSync(canonicalPath)).digest('hex');
  assert.equal(sha, '6f403c37eea6561e500f6292f435fbc2a544152415ea0c17f0c6ed4e58281b46');
});

test('public projection is deterministic and has no private implementation terms', () => {
  project();
  const first = fs.readFileSync(projectedPath, 'utf8');
  project();
  assert.equal(fs.readFileSync(projectedPath, 'utf8'), first);
  for (const pattern of forbidden) assert.doesNotMatch(first, pattern);
  const spec = JSON.parse(first);
  assert.deepEqual(spec.components.schemas.PaymentRequiredResponse.oneOf.map((x) => x.$ref), [
    '#/components/schemas/PaymentRequired',
    '#/components/schemas/CreditTopupRequired',
  ]);
  assert.equal(spec.components.schemas.CreditTopupRequired.properties.topup_url.type, 'string');
  assert.equal(spec.components.schemas.CreditTopupRequired.properties.topup_url.enum, undefined);
});

test('the public wrapper retains the semantic 402 response union', () => {
  const source = fs.readFileSync(path.join(sdkDir, 'src/index.ts'), 'utf8');
  assert.match(source, /PaymentRequiredResponse/);
  const models = fs.readFileSync(path.join(sdkDir, 'generated/src/models/index.ts'), 'utf8');
  assert.match(models, /export type PaymentRequiredResponse = CreditTopupRequired \| PaymentRequired;/);
});

test('generate uses the public projection', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(sdkDir, 'package.json'), 'utf8'));
  assert.match(packageJson.scripts.generate, /project-public-openapi\.js/);
  assert.match(packageJson.scripts.generate, /sdk\/\.generated\/replynodes-fetcher\.public\.openapi\.json/);
  assert.doesNotMatch(packageJson.scripts.generate, /-i \/local\/openapi\/replynodes-fetcher\.openapi\.json/);
});

test('tracked public generated files have no private implementation terms', () => {
  const files = execFileSync('git', ['ls-files', 'sdk/generated'], { cwd: repoRoot, encoding: 'utf8' })
    .trim().split('\n').filter(Boolean);
  assert.ok(files.length > 0);
  for (const file of files) {
    const contents = fs.readFileSync(path.join(repoRoot, file), 'utf8');
    for (const pattern of forbidden) assert.doesNotMatch(contents, pattern, `${file} contains ${pattern}`);
  }
});
