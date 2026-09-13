const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

test('tracked generated TypeScript has no trailing whitespace', () => {
  const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  const files = execFileSync('git', ['-C', repoRoot, 'ls-files', 'sdk/generated/src', '*.ts'], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);
  const offenders = [];

  assert.ok(files.length > 0, 'expected tracked generated TypeScript files');
  for (const file of files) {
    const contents = require('node:fs').readFileSync(path.join(repoRoot, file), 'utf8');
    contents.split('\n').forEach((line, index) => {
      if (/[ \t]+$/.test(line)) offenders.push(`${file}:${index + 1}`);
    });
  }

  assert.deepEqual(offenders, []);
});
