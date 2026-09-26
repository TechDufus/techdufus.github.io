#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST_DIR = path.resolve('dist');
const TOP_LEVEL_PAGES = [
  'index.html',
  'about/index.html',
  'blog/index.html',
  'docs/index.html',
  'contact/index.html',
  'lab/index.html'
];

const BUDGETS = {
  totalJsRawKb: 140,
  totalJsGzipKb: 48,
  totalInlineJsRawKb: 18,
  totalInlineJsGzipKb: 7,
  totalCssRawKb: 90,
  totalCssGzipKb: 24,
  // Per page: the tracked page set grows over time, so a single HTML total stops meaning anything.
  pageHtmlRawKb: 48,
  pageHtmlGzipKb: 14
};

const toKb = (bytes) => bytes / 1024;
const roundKb = (bytes) => Number(toKb(bytes).toFixed(2));

const readFileSafe = async (filePath) => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
};

const run = async () => {
  const assetPaths = new Set();
  const pageHtml = [];
  let totalInlineJsRawBytes = 0;
  let totalInlineJsGzipBytes = 0;

  for (const page of TOP_LEVEL_PAGES) {
    const pagePath = path.join(DIST_DIR, page);
    const html = await readFileSafe(pagePath);
    if (!html) {
      throw new Error(`Missing expected built page: dist/${page}`);
    }

    const htmlBuffer = Buffer.from(html, 'utf8');
    pageHtml.push({
      page,
      rawKb: roundKb(htmlBuffer.length),
      gzipKb: roundKb(gzipSync(htmlBuffer).length)
    });

    const inlineScripts = html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g);
    for (const scriptMatch of inlineScripts) {
      const inlineContent = scriptMatch[1] ?? '';
      const inlineBuffer = Buffer.from(inlineContent, 'utf8');
      totalInlineJsRawBytes += inlineBuffer.length;
      totalInlineJsGzipBytes += gzipSync(inlineBuffer).length;
    }

    const matches = html.matchAll(/(?:href|src)="(\/_astro\/[^"]+\.(?:css|js))"/g);
    for (const match of matches) {
      const relPath = match[1].replace(/^\//, '');
      assetPaths.add(relPath);
    }
  }

  let totalJsRawBytes = 0;
  let totalJsGzipBytes = 0;
  let totalCssRawBytes = 0;
  let totalCssGzipBytes = 0;

  for (const relPath of assetPaths) {
    const fullPath = path.join(DIST_DIR, relPath);
    const buffer = await fs.readFile(fullPath);
    const gzipped = gzipSync(buffer);

    if (relPath.endsWith('.js')) {
      totalJsRawBytes += buffer.length;
      totalJsGzipBytes += gzipped.length;
      continue;
    }

    if (relPath.endsWith('.css')) {
      totalCssRawBytes += buffer.length;
      totalCssGzipBytes += gzipped.length;
    }
  }

  const summary = {
    jsRawKb: roundKb(totalJsRawBytes),
    jsGzipKb: roundKb(totalJsGzipBytes),
    inlineJsRawKb: roundKb(totalInlineJsRawBytes),
    inlineJsGzipKb: roundKb(totalInlineJsGzipBytes),
    cssRawKb: roundKb(totalCssRawBytes),
    cssGzipKb: roundKb(totalCssGzipBytes),
    largestHtmlRawKb: Math.max(...pageHtml.map((p) => p.rawKb)),
    largestHtmlGzipKb: Math.max(...pageHtml.map((p) => p.gzipKb))
  };

  console.log('Performance budget summary:');
  console.log(`  JS (raw):  ${summary.jsRawKb} KB (budget ${BUDGETS.totalJsRawKb} KB)`);
  console.log(`  JS (gzip): ${summary.jsGzipKb} KB (budget ${BUDGETS.totalJsGzipKb} KB)`);
  console.log(
    `  Inline JS (raw):  ${summary.inlineJsRawKb} KB (budget ${BUDGETS.totalInlineJsRawKb} KB)`
  );
  console.log(
    `  Inline JS (gzip): ${summary.inlineJsGzipKb} KB (budget ${BUDGETS.totalInlineJsGzipKb} KB)`
  );
  console.log(`  CSS (raw): ${summary.cssRawKb} KB (budget ${BUDGETS.totalCssRawKb} KB)`);
  console.log(`  CSS (gzip):${summary.cssGzipKb} KB (budget ${BUDGETS.totalCssGzipKb} KB)`);
  console.log(
    `  HTML per page (largest raw):  ${summary.largestHtmlRawKb} KB (budget ${BUDGETS.pageHtmlRawKb} KB)`
  );
  console.log(
    `  HTML per page (largest gzip): ${summary.largestHtmlGzipKb} KB (budget ${BUDGETS.pageHtmlGzipKb} KB)`
  );

  const violations = [
    summary.jsRawKb > BUDGETS.totalJsRawKb
      ? `JS raw size exceeded: ${summary.jsRawKb} KB > ${BUDGETS.totalJsRawKb} KB`
      : null,
    summary.jsGzipKb > BUDGETS.totalJsGzipKb
      ? `JS gzip size exceeded: ${summary.jsGzipKb} KB > ${BUDGETS.totalJsGzipKb} KB`
      : null,
    summary.inlineJsRawKb > BUDGETS.totalInlineJsRawKb
      ? `Inline JS raw size exceeded: ${summary.inlineJsRawKb} KB > ${BUDGETS.totalInlineJsRawKb} KB`
      : null,
    summary.inlineJsGzipKb > BUDGETS.totalInlineJsGzipKb
      ? `Inline JS gzip size exceeded: ${summary.inlineJsGzipKb} KB > ${BUDGETS.totalInlineJsGzipKb} KB`
      : null,
    summary.cssRawKb > BUDGETS.totalCssRawKb
      ? `CSS raw size exceeded: ${summary.cssRawKb} KB > ${BUDGETS.totalCssRawKb} KB`
      : null,
    summary.cssGzipKb > BUDGETS.totalCssGzipKb
      ? `CSS gzip size exceeded: ${summary.cssGzipKb} KB > ${BUDGETS.totalCssGzipKb} KB`
      : null,
    ...pageHtml.flatMap(({ page, rawKb, gzipKb }) => [
      rawKb > BUDGETS.pageHtmlRawKb
        ? `HTML raw size exceeded for dist/${page}: ${rawKb} KB > ${BUDGETS.pageHtmlRawKb} KB`
        : null,
      gzipKb > BUDGETS.pageHtmlGzipKb
        ? `HTML gzip size exceeded for dist/${page}: ${gzipKb} KB > ${BUDGETS.pageHtmlGzipKb} KB`
        : null
    ])
  ].filter(Boolean);

  if (violations.length > 0) {
    for (const violation of violations) {
      console.error(`Budget violation: ${violation}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Performance budgets passed.');
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
