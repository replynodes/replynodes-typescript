const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const sdkDir = path.resolve(__dirname, '..');

test('packed package supports CommonJS, ESM, named exports, and declarations', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'replynodes-sdk-'));
  try {
    const tarball = execFileSync('npm', ['pack', '--pack-destination', temp], { cwd: sdkDir, encoding: 'utf8' }).trim().split('\n').pop();
    const consumer = path.join(temp, 'consumer');
    fs.mkdirSync(consumer);
    execFileSync('npm', ['init', '-y'], { cwd: consumer, stdio: 'ignore' });
    execFileSync('npm', ['install', '--ignore-scripts', path.join(temp, tarball)], { cwd: consumer, stdio: 'ignore' });
    const cjs = execFileSync(process.execPath, ['-e', "const sdk=require('@replynodes/sdk'); if(typeof sdk.ReplyNodes !== 'function') process.exit(1); if(typeof sdk.default !== 'function') process.exit(1);"], { cwd: consumer });
    assert.equal(cjs.toString(), '');
    execFileSync(process.execPath, ['--input-type=module', '-e', "import ReplyNodes, { ReplyNodesError } from '@replynodes/sdk'; if(typeof ReplyNodes !== 'function' || typeof ReplyNodesError !== 'function') process.exit(1);"], { cwd: consumer });
    const source = "import ReplyNodes, { ReplyNodesError, type GoogleSearchRequest, type ReplyNodesOptions, type WebBrandRequest } from '@replynodes/sdk'; const options: ReplyNodesOptions = { apiKey: 'test' }; const client = ReplyNodes(options); const search: GoogleSearchRequest = { text: 'test' }; const brand: WebBrandRequest = { url: 'https://example.com' }; void client; void search; void brand; void ReplyNodesError;";
    const declarationConsumer = path.join(consumer, 'index.mts');
    fs.writeFileSync(declarationConsumer, source);
    execFileSync(path.join(sdkDir, 'node_modules/.bin/tsc'), ['--noEmit', '--strict', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', declarationConsumer], { cwd: consumer, stdio: 'ignore' });

    const packedFiles = execFileSync('tar', ['-tzf', path.join(temp, tarball)], { encoding: 'utf8' }).split('\n');
    assert.ok(packedFiles.includes('package/dist/esm/src/esm-entry.d.ts'));
    assert.ok(packedFiles.includes('package/dist/cjs/src/index.d.ts'));
    assert.ok(!packedFiles.includes('package/generated/package.json'));
    const esmDeclaration = fs.readFileSync(path.join(consumer, 'node_modules/@replynodes/sdk/dist/esm/src/esm-entry.d.ts'), 'utf8');
    assert.match(esmDeclaration, /\.\.\/\.\.\/cjs\/src\/index\.js/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
