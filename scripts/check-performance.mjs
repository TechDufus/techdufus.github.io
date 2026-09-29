#!/usr/bin/env node
// Per-page performance budgets for the built site (run after `npm run build`).
// Each tracked page is measured on what a first visit downloads: its HTML, the CSS it links,
// the JS it loads (entry scripts plus their static imports, followed transitively) and its
// inline scripts. Budgets are per page, so adding pages never erodes a site-wide total.

import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST_DIR = path.resolve('dist');

const BUDGETS = {
  html: { rawKb: 48, gzipKb: 14 },
  css: { rawKb: 90, gzipKb: 24 },
  js: { rawKb: 64, gzipKb: 24 },
  inlineJs: { rawKb: 18, gzipKb: 7 }
};

// Drawing sheets ship their drawings as inline SVG generated at build time, so their HTML
// carries the artwork that other pages would load as images (20 KB gzip is still lighter than
// one hero photo).
const DRAWING_HTML = { rawKb: 80, gzipKb: 20 };
// HTML fragments fetched after load (Sheet 01's secondary views): off the first-paint path, but
// still budgeted so they can't grow unchecked.
const LAZY_HTML = { rawKb: 96, gzipKb: 18 };

/** Tracked pages; `html` overrides the default HTML budget. */
const PAGES = [
  { page: 'index.html' },
  { page: 'about/index.html' },
  { page: 'blog/index.html' },
  { page: 'docs/index.html' },
  { page: 'contact/index.html' },
  { page: 'lab/index.html', html: DRAWING_HTML },
  { page: 'projects/index.html' },
  { page: 'lab/rack/index.html', html: DRAWING_HTML },
  { page: 'lab/r720xd/index.html', html: DRAWING_HTML },
  { page: 'lab/stack/index.html', html: DRAWING_HTML },
  { page: 'blog/from-hardware-raid-to-zfs/index.html', html: DRAWING_HTML },
  { page: 'lab/rack/views/index.html', html: LAZY_HTML },
  { page: 'lab/r720xd/views/index.html', html: LAZY_HTML }
];
const kb = (bytes) => Number((bytes / 1024).toFixed(2));
const sizeOf = (buffer) => ({ raw: buffer.length, gzip: gzipSync(buffer).length });

const readSafe = async (filePath) => {
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
};

/** Resolves a JS asset and every chunk it statically imports (relative `./x.js` inside dist/_astro). */
const collectJs = async (relPath, seen) => {
  if (seen.has(relPath)) return;
  seen.add(relPath);
  const source = await readSafe(path.join(DIST_DIR, relPath));
  if (!source) throw new Error(`Missing JS asset: dist/${relPath}`);
  const dir = path.posix.dirname(relPath);
  const imports = source
    .toString('utf8')
    .matchAll(/(?:\bimport\s*|\bfrom\s*|\bexport\s*\*\s*from\s*)["'](\.\/[^"']+\.js)["']/g);
  for (const [, spec] of imports) {
    await collectJs(path.posix.join(dir, spec), seen);
  }
};

const measurePage = async ({ page, html: htmlBudget }) => {
  const htmlBuffer = await readSafe(path.join(DIST_DIR, page));
  if (!htmlBuffer) throw new Error(`Missing expected built page: dist/${page}`);
  const html = htmlBuffer.toString('utf8');

  const inline = { raw: 0, gzip: 0 };
  for (const [, body] of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    if (!body.trim()) continue;
    const size = sizeOf(Buffer.from(body, 'utf8'));
    inline.raw += size.raw;
    inline.gzip += size.gzip;
  }

  const cssFiles = new Set();
  const jsFiles = new Set();
  for (const [, asset, ext] of html.matchAll(/(?:href|src)="\/(_astro\/[^"]+\.(css|js))"/g)) {
    if (ext === 'css') cssFiles.add(asset);
    else await collectJs(asset, jsFiles);
  }

  const sum = async (files) => {
    const total = { raw: 0, gzip: 0 };
    for (const file of files) {
      const buffer = await readSafe(path.join(DIST_DIR, file));
      if (!buffer) throw new Error(`Missing asset: dist/${file}`);
      const size = sizeOf(buffer);
      total.raw += size.raw;
      total.gzip += size.gzip;
    }
    return total;
  };

  return {
    page,
    budgets: { ...BUDGETS, html: htmlBudget ?? BUDGETS.html },
    sizes: { html: sizeOf(htmlBuffer), css: await sum(cssFiles), js: await sum(jsFiles), inlineJs: inline }
  };
};

const run = async () => {
  const results = [];
  for (const entry of PAGES) results.push(await measurePage(entry));

  const kinds = ['html', 'css', 'js', 'inlineJs'];
  const label = { html: 'HTML', css: 'CSS', js: 'JS', inlineJs: 'Inline JS' };
  const width = Math.max(...results.map((r) => r.page.length));

  console.log('Per-page budgets (raw / gzip KB):');
  console.log(
    `  ${'defaults'.padEnd(width)}  ${kinds.map((k) => `${label[k]} ${BUDGETS[k].rawKb}/${BUDGETS[k].gzipKb}`).join('  ')}` +
      `  (drawing HTML ${DRAWING_HTML.rawKb}/${DRAWING_HTML.gzipKb}, lazy HTML ${LAZY_HTML.rawKb}/${LAZY_HTML.gzipKb})`
  );
  for (const { page, sizes } of results) {
    const cells = kinds.map((k) => `${label[k]} ${kb(sizes[k].raw)}/${kb(sizes[k].gzip)}`);
    console.log(`  ${page.padEnd(width)}  ${cells.join('  ')}`);
  }

  const violations = results.flatMap(({ page, sizes, budgets }) =>
    kinds.flatMap((k) => [
      kb(sizes[k].raw) > budgets[k].rawKb
        ? `${label[k]} raw for dist/${page}: ${kb(sizes[k].raw)} KB > ${budgets[k].rawKb} KB`
        : null,
      kb(sizes[k].gzip) > budgets[k].gzipKb
        ? `${label[k]} gzip for dist/${page}: ${kb(sizes[k].gzip)} KB > ${budgets[k].gzipKb} KB`
        : null
    ])
  ).filter(Boolean);

  if (violations.length > 0) {
    for (const violation of violations) console.error(`Budget violation: ${violation}`);
    process.exitCode = 1;
    return;
  }

  console.log('Performance budgets passed.');
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
