const fs = require('node:fs');
const entry = 'dist/esm/src/esm-entry.js';
fs.writeFileSync(entry, fs.readFileSync(entry, 'utf8').replace("../dist/cjs/src/index.js", "../../cjs/src/index.js"));
fs.writeFileSync('dist/esm/package.json', '{"type":"module"}\n');
