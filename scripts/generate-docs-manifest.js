#!/usr/bin/env node
/**
 * Generates docs-index.json and docs-graph.json from MDX source files.
 *
 * docs-index.json  — slug, title, section, 1-sentence summary for each page
 * docs-graph.json  — slug → related pages with reasons (cross-section connections)
 *
 * These are committed to the repo and served as static assets at /data/*.json.
 * Re-run whenever docs content changes significantly.
 *
 * Usage:
 *   OPENROUTER_API_KEY=sk-or-... node scripts/generate-docs-manifest.js
 *   OPENROUTER_API_KEY=sk-or-... node scripts/generate-docs-manifest.js --dry-run
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DOCS_DIR = join(ROOT, 'src', 'content', 'docs');
const OUT_DIR = join(ROOT, 'public', 'data');
const BATCH_SIZE = 20; // pages per API call — keeps output tokens well within limits
const DRY_RUN = process.argv.includes('--dry-run');
const OUTPUT_FILES = new Set(['docs-index.json', 'docs-graph.json']);
const MAX_OPENROUTER_PROMPT_CHARS = 250000;

/** @spec HELP-GEN-011 */
function sanitizeText(value, maxLength = 500) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/** @spec HELP-GEN-011 */
function sanitizeRelatedList(related, knownSlugs) {
  if (!Array.isArray(related)) return [];
  return related
    .map(item => ({
      slug: sanitizeText(item?.slug, 200),
      reason: sanitizeText(item?.reason, 500),
    }))
    .filter(item => knownSlugs.has(item.slug) && item.reason);
}

/** @spec HELP-GEN-011 */
function sanitizeBatchResult(result, knownSlugs) {
  if (!Array.isArray(result?.pages)) {
    throw new Error('OpenRouter response missing pages array');
  }
  return result.pages
    .map(page => ({
      slug: sanitizeText(page?.slug, 200),
      summary: sanitizeText(page?.summary, 160),
      related: sanitizeRelatedList(page?.related, knownSlugs),
    }))
    .filter(page => knownSlugs.has(page.slug) && page.summary);
}

/** @spec HELP-GEN-011 */
function sanitizeCrossConnections(result, knownSlugs) {
  if (!Array.isArray(result?.connections)) return [];
  return result.connections
    .map(conn => ({
      from: sanitizeText(conn?.from, 200),
      to: sanitizeText(conn?.to, 200),
      reason: sanitizeText(conn?.reason, 500),
    }))
    .filter(conn => knownSlugs.has(conn.from) && knownSlugs.has(conn.to) && conn.from !== conn.to && conn.reason);
}

/** @spec HELP-GEN-011 */
function writeStaticJson(filename, data) {
  if (!OUTPUT_FILES.has(filename)) {
    throw new Error(`Refusing to write unexpected output file: ${filename}`);
  }
  writeFileSync(join(OUT_DIR, filename), JSON.stringify(data, null, 2));
}

// ---------------------------------------------------------------------------
// File utilities
// ---------------------------------------------------------------------------

function collectMdx(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectMdx(full, files);
    } else if (extname(entry) === '.mdx') {
      files.push(full);
    }
  }
  return files;
}

function toSlug(filePath) {
  const rel = relative(DOCS_DIR, filePath);
  return rel.replace(/\.mdx$/, '').replace(/\/index$/, '');
}

function parseFile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  let title = '';
  let description = '';
  if (fmMatch) {
    const fm = fmMatch[1];
    const titleMatch = fm.match(/^title:\s*(.+)$/m);
    const descMatch = fm.match(/^description:\s*(.+)$/m);
    if (titleMatch) title = titleMatch[1].replace(/^['"]|['"]$/g, '').trim();
    if (descMatch) description = descMatch[1].replace(/^['"]|['"]$/g, '').trim();
  }
  // Strip frontmatter + import statements, take first 600 chars of body
  const body = raw
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^import\s+.*?from\s+.*?;\n/gm, '')
    .trim();
  const excerpt = body.slice(0, 600).trim();
  return { title, description, excerpt };
}

// ---------------------------------------------------------------------------
// Claude API
// ---------------------------------------------------------------------------

const MODEL = 'anthropic/claude-sonnet-4-6';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/** @spec HELP-GEN-006 */
async function callOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY environment variable is required');

  // This docs manifest generator intentionally sends docs excerpts to OpenRouter.
  // The prompt body is bounded and assembled only from discovered docs excerpts. lgtm[js/file-access-to-http]
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': 'https://docs.producerdashboard.app',
      'X-Title': 'Producer Dashboard Docs Manifest',
    },
    body: JSON.stringify(buildOpenRouterRequestBody(prompt)),
    signal: AbortSignal.timeout(90000),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content.trim();
  const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(clean);
}

/** @spec HELP-GEN-006 */
function buildOpenRouterRequestBody(prompt) {
  const content = assertOpenRouterPrompt(prompt);
  return {
    model: MODEL,
    max_tokens: 16000,
    messages: [{ role: 'user', content }],
  };
}

/** @spec HELP-GEN-006 */
function assertOpenRouterPrompt(prompt) {
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('OpenRouter prompt must be a non-empty string');
  }
  if (prompt.length > MAX_OPENROUTER_PROMPT_CHARS) {
    throw new Error(`OpenRouter prompt exceeds ${MAX_OPENROUTER_PROMPT_CHARS} characters`);
  }
  if (prompt.includes('\u0000')) {
    throw new Error('OpenRouter prompt must not contain NUL bytes');
  }
  return prompt;
}

async function callClaude(pagesBatch) {

  const pageList = pagesBatch
    .map(p => [
      `SLUG: ${p.slug}`,
      `SECTION: ${p.section}`,
      `TITLE: ${p.title}`,
      p.description ? `DESCRIPTION: ${p.description}` : '',
      `EXCERPT:\n${p.excerpt}`,
    ].filter(Boolean).join('\n'))
    .join('\n\n---\n\n');

  const prompt = `You are analyzing documentation pages for Producer Dashboard — a music production management app for beat makers and producers.

Analyze the following documentation pages. For EACH page return:
1. A concise 1-sentence summary (max 120 characters) of what the page covers
2. 2–5 related pages that a user reading this page would also benefit from — prioritise cross-section connections over same-section ones, and focus on non-obvious feature interactions

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "pages": [
    {
      "slug": "exact-slug-from-input",
      "summary": "One sentence summary under 120 chars",
      "related": [
        { "slug": "related-page-slug", "reason": "brief reason" }
      ]
    }
  ]
}

Related slugs must be chosen from this full slug list (only use slugs from this list):
${pagesBatch.map(p => p.slug).join(', ')}

Pages to analyse:

${pageList}`;

  return callOpenRouter(prompt);
}

// ---------------------------------------------------------------------------
// Cross-batch connection enrichment
// ---------------------------------------------------------------------------

async function enrichCrossConnections(allPages, indexMap) {

  const slugList = allPages.map(p => p.slug).join('\n');
  const summaryList = allPages
    .map(p => `${p.slug}: ${indexMap[p.slug]?.summary || p.title}`)
    .join('\n');

  const prompt = `You are a documentation architect for Producer Dashboard — a music production management app.

Below are all documentation pages with their summaries. Identify the most important CROSS-SECTION connections — cases where understanding one page is significantly improved by knowing about a page in a DIFFERENT section. Focus on feature interactions, shared concepts, and workflows that span multiple areas.

Return ONLY valid JSON (no markdown):
{
  "connections": [
    {
      "from": "slug-a",
      "to": "slug-b",
      "reason": "brief reason why these interact"
    }
  ]
}

Only use slugs from this list:
${slugList}

Page summaries:
${summaryList}`;

  return callOpenRouter(prompt);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Reading docs...');
  const files = collectMdx(DOCS_DIR);

  const pages = files
    .map(f => {
      const slug = toSlug(f);
      const { title, description, excerpt } = parseFile(f);
      const section = slug.includes('/') ? slug.split('/')[0] : slug;
      return { slug, section, title, description, excerpt };
    })
    .filter(p => p.title); // skip pages with no frontmatter title
  const knownSlugs = new Set(pages.map(p => p.slug));
  const pagesBySlug = new Map(pages.map(p => [p.slug, p]));

  console.log(`Found ${pages.length} pages across ${new Set(pages.map(p => p.section)).size} sections.`);

  if (DRY_RUN) {
    console.log('\n--dry-run: listing pages that would be processed:\n');
    for (const p of pages) console.log(`  ${p.slug}`);
    console.log('\nNo API calls made.');
    return;
  }

  // Process in batches
  const batches = [];
  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    batches.push(pages.slice(i, i + BATCH_SIZE));
  }

  console.log(`Processing ${batches.length} batch${batches.length > 1 ? 'es' : ''} of up to ${BATCH_SIZE} pages...`);

  const allResults = [];
  for (let i = 0; i < batches.length; i++) {
    console.log(`  Batch ${i + 1}/${batches.length} (${batches[i].length} pages)...`);
    const result = await callClaude(batches[i]);
    allResults.push(...sanitizeBatchResult(result, knownSlugs));
  }

  // Build initial index and graph from batch results
  const indexMap = {};
  const graph = {};

  for (const p of allResults) {
    const original = pagesBySlug.get(p.slug);
    indexMap[p.slug] = {
      slug: p.slug,
      title: original?.title || p.slug,
      section: original?.section || '',
      summary: p.summary,
    };
    graph[p.slug] = p.related || [];
  }

  // Enrich with cross-batch connections (pass 2)
  console.log('  Enriching cross-section connections...');
  const crossResult = await enrichCrossConnections(pages, indexMap);

  for (const conn of sanitizeCrossConnections(crossResult, knownSlugs)) {
    if (!graph[conn.from]) graph[conn.from] = [];
    if (!graph[conn.to]) graph[conn.to] = [];

    // Add bidirectionally if not already present
    if (!graph[conn.from].some(r => r.slug === conn.to)) {
      graph[conn.from].push({ slug: conn.to, reason: conn.reason });
    }
    if (!graph[conn.to].some(r => r.slug === conn.from)) {
      graph[conn.to].push({ slug: conn.from, reason: conn.reason });
    }
  }

  // Build final sorted index array
  const index = pages.map(p => indexMap[p.slug]).filter(Boolean);

  // Write output
  mkdirSync(OUT_DIR, { recursive: true });
  writeStaticJson('docs-index.json', index);
  writeStaticJson('docs-graph.json', graph);

  const totalConnections = Object.values(graph).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`\n✓ public/data/docs-index.json — ${index.length} pages`);
  console.log(`✓ public/data/docs-graph.json — ${totalConnections} connections`);
  console.log('\nDone. Commit both files to the repo.');
}

main().catch(e => {
  console.error('\nError:', e.message);
  process.exit(1);
});
