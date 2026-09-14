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
    const source = "import ReplyNodes, { ReplyNodesError, type ReplyNodesOptions } from '@replynodes/sdk'; const options: ReplyNodesOptions = { apiKey: 'test' }; const client = ReplyNodes(options); void client; void ReplyNodesError;";
    fs.writeFileSync(path.join(consumer, 'index.ts'), source);
    execFileSync(path.join(sdkDir, 'node_modules/.bin/tsc'), ['--noEmit', '--strict', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', path.join(consumer, 'index.ts')], { cwd: consumer, stdio: 'ignore' });
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
