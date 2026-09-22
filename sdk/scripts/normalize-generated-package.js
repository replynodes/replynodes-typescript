'use strict';

const fs = require('node:fs');
const path = require('node:path');

const sdkDir = path.resolve(__dirname, '..');
const sdkPackagePath = path.join(sdkDir, 'package.json');
const generatedPackagePath = path.join(sdkDir, 'generated', 'package.json');

const sdkPackage = JSON.parse(fs.readFileSync(sdkPackagePath, 'utf8'));
const generatedPackage = JSON.parse(fs.readFileSync(generatedPackagePath, 'utf8'));

const normalizedPackage = {
  name: sdkPackage.name,
  version: sdkPackage.version,
  description: 'Internal generated OpenAPI sources for @replynodes/sdk',
  private: true,
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/replynodes/replynodes-typescript.git',
  },
  homepage: 'https://replynodes.com',
  bugs: {
    url: 'https://github.com/replynodes/replynodes-typescript/issues',
  },
  keywords: ['replynodes', 'sdk', 'rest', 'api', 'typescript', 'fetch'],
  engines: { node: '>=18' },
  main: generatedPackage.main || './dist/index.js',
  typings: generatedPackage.typings || './dist/index.d.ts',
  module: generatedPackage.module || './dist/esm/index.js',
  sideEffects: false,
  scripts: generatedPackage.scripts || {
    build: 'tsc && tsc -p tsconfig.esm.json',
    prepare: 'npm run build',
  },
  devDependencies: generatedPackage.devDependencies || {
    typescript: '^4.0 || ^5.0',
  },
};

fs.writeFileSync(generatedPackagePath, `${JSON.stringify(normalizedPackage, null, 2)}\n`);
