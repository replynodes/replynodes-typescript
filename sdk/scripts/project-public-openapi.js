#!/usr/bin/env node

/**
 * Build the public generator input from the canonical contract.
 *
 * The canonical OpenAPI document is provenance-controlled and must not be
 * edited for SDK presentation concerns. This projection is deterministic,
 * local-only, and contains no credentials or network access.
 */
const fs = require('node:fs');
const path = require('node:path');

const sdkDir = path.resolve(__dirname, '..');
const sourcePath = path.resolve(sdkDir, '..', 'openapi', 'replynodes-fetcher.openapi.json');
const outputDir = path.join(sdkDir, '.generated');
const outputPath = path.join(outputDir, 'replynodes-fetcher.public.openapi.json');

const document = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

function scrub(value) {
  if (Array.isArray(value)) return value.map(scrub);
  if (!value || typeof value !== 'object') return value;

  for (const [key, child] of Object.entries(value)) {
    if (key === 'description' && typeof child === 'string') {
      value[key] = child
        .replace(/ Returns the normalized public contract; raw provider records are internal to the runtime boundary and never cross the public gateway\.?/gi, ' Returns the normalized public contract.')
        .replace(/Provider collection constant\.?/gi, 'Collection constant.')
        .replace(/Provider category constant\.?/gi, 'Category constant.')
        .replace(/Provider review sort constant\.?/gi, 'Review sort constant.')
        .replace(/ Backed by a privately deployed webclaw-server instance; upstream implementation details are never exposed\.?/gi, '')
        .replace(/max_pages\/max_depth are clamped server-side regardless of the requested value\.?/gi, 'The service clamps max_pages/max_depth regardless of the requested value.');
    } else {
      value[key] = scrub(child);
    }
  }
  return value;
}

scrub(document);

for (const schemaName of ['CreditTopupRequired']) {
  const property = document.components.schemas[schemaName].properties.topup_url;
  delete property.enum;
  property.description = 'URL for completing the required account action.';
}
const prepaidUrl = document.components.schemas.PaymentRequiredPrepaidExtensions.properties.topup.properties.topup_url;
delete prepaidUrl.enum;
prepaidUrl.description = 'URL for completing the required account action.';

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`);
process.stdout.write(`${path.relative(process.cwd(), outputPath)}\n`);
