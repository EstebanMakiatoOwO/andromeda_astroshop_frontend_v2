// Angular caps the <link rel="modulepreload"> hints it injects at 10, and
// doesn't pick by size — on this app it left out the two largest initial
// chunks (Angular core), which then only start downloading once main.js has
// been fetched and parsed. This adds a hint for every chunk reachable from
// main.js through static imports, so the whole initial graph downloads in
// parallel straight from the HTML. Runs automatically as `postbuild`.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'dist/andromeda_astroshop_v2/browser';
const indexPath = join(dir, 'index.html');
let html = readFileSync(indexPath, 'utf8');

const main = readdirSync(dir).find(f => /^main-[A-Z0-9]+\.js$/.test(f));
if (!main) throw new Error(`main-*.js not found in ${dir}`);

// Static imports only (`import{..}from"./x.js"` / `import"./x.js"`);
// dynamic `import("./x.js")` stays lazy on purpose.
const STATIC_IMPORT = /(?:from|import)\s*"\.\/(chunk-[A-Z0-9]+\.js)"/g;
const seen = new Set();
const queue = [main];
while (queue.length) {
  const src = readFileSync(join(dir, queue.shift()), 'utf8');
  for (const [, chunk] of src.matchAll(STATIC_IMPORT)) {
    if (!seen.has(chunk)) { seen.add(chunk); queue.push(chunk); }
  }
}

const missing = [...seen].filter(c => !html.includes(`href="${c}"`));
if (missing.length) {
  const links = missing.map(c => `<link rel="modulepreload" href="${c}">`).join('');
  html = html.replace(/<script src="main-/, `${links}<script src="main-`);
  writeFileSync(indexPath, html);
}
console.log(`modulepreload: +${missing.length} (${seen.size} initial chunks total)`);
