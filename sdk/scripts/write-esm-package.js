const fs = require('node:fs');
const entry = 'dist/esm/src/esm-entry.js';
const esmImport = "../../cjs/src/index.js";
fs.writeFileSync(entry, fs.readFileSync(entry, 'utf8').replaceAll("../dist/cjs/src/index.js", esmImport));
const declaration = 'dist/esm/src/esm-entry.d.ts';
fs.writeFileSync(declaration, fs.readFileSync(declaration, 'utf8').replaceAll("../dist/cjs/src/index.js", esmImport));
fs.writeFileSync('dist/esm/package.json', '{"type":"module"}\n');
