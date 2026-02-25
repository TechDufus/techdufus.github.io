#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const repoRoot = process.cwd();
const postsSrcDir = path.join(repoRoot, '_posts');
const setupSrcDir = path.join(repoRoot, '_setup');
const blogDestDir = path.join(repoRoot, 'src/content/blog');
const setupDestDir = path.join(repoRoot, 'src/content/setup');
const publicDir = path.join(repoRoot, 'public');

const POST_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/;

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripMarkdown(value) {
  let text = value;

  text = text.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/`[^`]*`/g, ' ');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  text = text.replace(/[>#*_~]/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

function pickDescription(rawContent, fallback = 'No description provided.') {
  const normalized = rawContent.replace(/\r\n/g, '\n');
  const blocks = normalized
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  for (const block of blocks) {
    if (
      block.startsWith('#') ||
      block.startsWith('![') ||
      block.startsWith('<style') ||
      block.startsWith('```')
    ) {
      continue;
    }

    const clean = stripMarkdown(block);
    if (clean.length < 20) continue;

    const sentence = clean.match(/^[\s\S]*?[.!?](?=\s|$)/)?.[0] ?? clean;
    return sentence.slice(0, 220).trim();
  }

  const stripped = stripMarkdown(normalized);
  if (stripped.length > 0) return stripped.slice(0, 220).trim();
  return fallback;
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function setupSectionFromFilename(fileName) {
  const base = fileName.toLowerCase();
  if (base === 'hardware.md') return 'hardware';
  if (base === 'software.md') return 'software';
  if (base === 'homelab.md') return 'homelab';
  return 'other';
}

async function ensureCleanDirectory(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyPublicAssets() {
  await fs.mkdir(publicDir, { recursive: true });

  const imageSource = path.join(repoRoot, 'img');
  const imageDest = path.join(publicDir, 'img');
  await fs.rm(imageDest, { recursive: true, force: true });
  await fs.cp(imageSource, imageDest, { recursive: true });
  await removeMacMetadataFiles(imageDest);

  const cnameSource = path.join(repoRoot, 'CNAME');
  const cnameDest = path.join(publicDir, 'CNAME');
  await fs.copyFile(cnameSource, cnameDest);
}

async function removeMacMetadataFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await removeMacMetadataFiles(entryPath);
      continue;
    }

    if (entry.name === '.DS_Store') {
      await fs.rm(entryPath, { force: true });
    }
  }
}

async function migratePosts() {
  const files = (await fs.readdir(postsSrcDir))
    .filter((file) => file.endsWith('.md'))
    .sort();

  for (const fileName of files) {
    const match = fileName.match(POST_DATE_RE);
    if (!match) {
      throw new Error(`Unexpected post filename format: ${fileName}`);
    }

    const [, year, month, day, rawSlug] = match;
    const filePath = path.join(postsSrcDir, fileName);
    const sourceText = await fs.readFile(filePath, 'utf8');
    const parsed = matter(sourceText);

    const title = String(parsed.data.title ?? rawSlug.replace(/-/g, ' ')).trim();
    const category = parsed.data.category ? String(parsed.data.category).trim() : undefined;
    const tags = normalizeTags(parsed.data.tags);
    const summary = parsed.data.summary ? String(parsed.data.summary).trim() : '';
    const description = summary || pickDescription(parsed.content);
    const pubDate = `${year}-${month}-${day}`;
    const created =
      parsed.data.created instanceof Date
        ? parsed.data.created.toISOString().slice(0, 10)
        : parsed.data.created
          ? String(parsed.data.created).trim()
          : undefined;
    const slug = slugify(rawSlug);

    const frontmatter = {
      title,
      description,
      pubDate,
      tags,
      ...(category ? { category } : {}),
      ...(created ? { created } : {})
    };

    const output = matter.stringify(parsed.content.trimStart(), frontmatter);
    await fs.writeFile(path.join(blogDestDir, `${slug}.md`), output, 'utf8');
  }

  return files.length;
}

async function migrateSetupDocs() {
  const files = (await fs.readdir(setupSrcDir))
    .filter((file) => file.endsWith('.md'))
    .sort();

  for (const fileName of files) {
    const filePath = path.join(setupSrcDir, fileName);
    const sourceText = await fs.readFile(filePath, 'utf8');
    const parsed = matter(sourceText);

    const baseName = fileName.replace(/\.md$/, '');
    const slug = slugify(baseName.replace(/^_+/, ''));
    const heading = parsed.content.match(/^#\s+(.+)$/m)?.[1]?.trim();
    const title = String(parsed.data.title ?? heading ?? baseName.replace(/_/g, ' ')).trim();
    const description = pickDescription(parsed.content);
    const section = setupSectionFromFilename(fileName);

    const frontmatter = {
      title,
      description,
      section
    };

    const output = matter.stringify(parsed.content.trimStart(), frontmatter);
    await fs.writeFile(path.join(setupDestDir, `${slug}.md`), output, 'utf8');
  }

  return files.length;
}

async function main() {
  await ensureCleanDirectory(blogDestDir);
  await ensureCleanDirectory(setupDestDir);

  const [postCount, setupCount] = await Promise.all([
    migratePosts(),
    migrateSetupDocs(),
    copyPublicAssets()
  ]);

  console.log(`Migrated ${postCount} posts -> src/content/blog`);
  console.log(`Migrated ${setupCount} setup docs -> src/content/setup`);
  console.log('Copied assets -> public/img and public/CNAME');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
