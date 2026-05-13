/**
 * @copyright 2025 Glimbr Pty Ltd
 * @spec HELP-GEN-001
 * @version 2026-03-29-v1
 */

import 'dotenv/config';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, relative, isAbsolute } from 'path';

import { OPENROUTER, PATHS, SYSTEM_PROMPT } from './help-doc-config.mjs';
import {
    extractSpecSections,
    readCodeFile,
    validateResponse,
    buildSidebarConfig,
} from './help-doc-utils.mjs';

// ---------------------------------------------------------------------------
// Fail fast if API key is missing
// ---------------------------------------------------------------------------
const API_KEY = OPENROUTER.api_key;
if (!API_KEY) {
    console.error('ERROR: OPENROUTER_API_KEY is not set in environment. Add it to .env');
    process.exit(1);
}

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
/** @spec HELP-GEN-002 */
function parseArgs(argv) {
    const args = {
        dryRun: false,
        only: null,
        section: null,
        failuresOnly: false,
        concurrency: OPENROUTER.concurrency,
    };

    for (const arg of argv.slice(2)) {
        if (arg === '--dry-run') {
            args.dryRun = true;
        } else if (arg.startsWith('--only=')) {
            args.only = arg.slice('--only='.length);
        } else if (arg.startsWith('--section=')) {
            args.section = arg.slice('--section='.length);
        } else if (arg === '--failures-only') {
            args.failuresOnly = true;
        } else if (arg.startsWith('--concurrency=')) {
            const n = parseInt(arg.slice('--concurrency='.length), 10);
            if (!isNaN(n) && n > 0) args.concurrency = n;
        }
    }

    return args;
}

// ---------------------------------------------------------------------------
// Load manifest and filter
// ---------------------------------------------------------------------------
/** @spec HELP-GEN-003 */
function loadManifest(args) {
    const manifestPath = resolve(PATHS.root, 'doc-manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    if (args.only) {
        return manifest.filter((e) => e.doc_id === args.only);
    }

    if (args.section) {
        return manifest.filter((e) => e.doc_id.startsWith(args.section));
    }

    if (args.failuresOnly) {
        const reportPath = resolve(PATHS.root, 'generation-report.json');
        if (!existsSync(reportPath)) {
            console.error('ERROR: No generation-report.json found. Run a full generation first.');
            process.exit(1);
        }
        const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
        const failedIds = new Set(report.failures.map((f) => f.doc_id));
        return manifest.filter((e) => failedIds.has(e.doc_id));
    }

    return manifest;
}

// ---------------------------------------------------------------------------
// Snapshot exemplar docs (before generation overwrites them)
// ---------------------------------------------------------------------------
/** @spec HELP-GEN-004 */
function snapshotExemplars() {
    const exemplarPaths = [
        resolve(PATHS.docs_dir, 'activity-panel/overview-widget.mdx'),
        resolve(PATHS.docs_dir, 'getting-started/quick-tour.mdx'),
        resolve(PATHS.docs_dir, 'sharing/creating-share-links.mdx'),
    ];

    const exemplars = [];
    for (const p of exemplarPaths) {
        if (existsSync(p)) {
            exemplars.push(readFileSync(p, 'utf-8'));
        }
    }
    return exemplars;
}

// ---------------------------------------------------------------------------
// Build user prompt for a single doc job
// ---------------------------------------------------------------------------
/** @spec HELP-GEN-005 */
function buildUserPrompt(entry, manifest, exemplars) {
    const parts = [];

    parts.push(`Generate a help documentation page for: ${entry.title}`);
    parts.push(`Section: ${entry.section}`);

    // Spec content
    const specContent = [];
    for (const specPath of entry.spec_files) {
        const extracted = extractSpecSections(specPath, entry.spec_sections);
        if (extracted) specContent.push(extracted);
    }
    if (specContent.length > 0) {
        parts.push(`\n## Source Spec\n${specContent.join('\n\n---\n\n')}`);
    }

    // Code file content
    const codeContent = [];
    for (const codeFile of entry.code_files) {
        const content = readCodeFile(codeFile);
        if (content) codeContent.push(content);
    }
    if (codeContent.length > 0) {
        parts.push(
            `\n## Source Code (for behavioral reference only — do NOT expose internals)\n${codeContent.join('\n\n---\n\n')}`
        );
    }

    // Screenshots
    if (entry.screenshots && entry.screenshots.length > 0) {
        const screenshotList = entry.screenshots
            .map((s) => `- ${entry.screenshot_relative_path}/${s}.png`)
            .join('\n');
        parts.push(`\n## Screenshots Available\n${screenshotList}`);
    }

    // Related docs (same section)
    const related = manifest
        .filter((e) => e.section === entry.section && e.doc_id !== entry.doc_id)
        .map((e) => `- [${e.title}](/${e.doc_id.replace(/\/index$/, '')})`)
        .join('\n');
    if (related) {
        parts.push(`\n## Related Docs (link to these in the Related section)\n${related}`);
    }

    // Style exemplar (first one, truncated)
    if (exemplars.length > 0) {
        const exemplar = exemplars[0].slice(0, 3000);
        parts.push(`\n## Style Examples (match this tone and structure)\n${exemplar}`);
    }

    parts.push('\nWrite the complete .mdx file including frontmatter.');
    parts.push('Target: 800-1500 words. Ready to publish.');

    return parts.join('\n');
}

// ---------------------------------------------------------------------------
// API call with retry logic
// ---------------------------------------------------------------------------
/** @spec HELP-GEN-006 */
async function callOpenRouter(userPrompt, retryState) {
    const { initial_delay_ms, max_delay_ms, max_retries, factor } = OPENROUTER.backoff;
    let attempt = 0;
    let delay = initial_delay_ms;

    while (attempt <= max_retries) {
        try {
            const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://producerdashboard.app',
                    'X-Title': 'Producer Dashboard Help Docs Generator',
                },
                body: JSON.stringify({
                    model: OPENROUTER.model,
                    provider: { order: ['minimax', 'novita', 'atlas-cloud'] },
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: OPENROUTER.temperature,
                    max_tokens: OPENROUTER.max_tokens,
                }),
                signal: AbortSignal.timeout(90000),
            });

            if (resp.status === 429) {
                attempt++;
                if (attempt > max_retries) throw new Error('Rate limited after max retries');
                retryState.halveConcurrency();
                console.log(`    Rate limited — backing off ${delay}ms, concurrency now ${retryState.getConcurrency()}`);
                await sleep(delay);
                delay = Math.min(delay * factor, max_delay_ms);
                continue;
            }

            if (resp.status >= 500) {
                attempt++;
                if (attempt > max_retries) throw new Error(`Server error ${resp.status} after retries`);
                console.log(`    Server error ${resp.status} — retrying in 5s`);
                await sleep(5000);
                continue;
            }

            if (!resp.ok) {
                const errBody = await resp.text();
                throw new Error(`API error ${resp.status}: ${errBody.slice(0, 200)}`);
            }

            const data = await resp.json();

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Malformed API response — no choices');
            }

            let content = data.choices[0].message.content || '';

            // Strip markdown code fences if the model wrapped the response
            content = content.replace(/^```(?:mdx|markdown|md|yaml)?\s*\n/i, '');
            content = content.replace(/\n```\s*$/, '');
            content = content.trim();

            return {
                content,
                usage: data.usage || { prompt_tokens: 0, completion_tokens: 0 },
            };
        } catch (err) {
            if (err.name === 'TimeoutError' || err.name === 'AbortError') {
                attempt++;
                if (attempt > max_retries) throw new Error('Request timed out after retries');
                console.log(`    Timeout — retrying (attempt ${attempt}/${max_retries})`);
                continue;
            }

            if (err.message.includes('Malformed')) {
                attempt++;
                if (attempt > max_retries) throw err;
                console.log(`    Malformed response — retrying with instruction`);
                userPrompt += '\n\nIMPORTANT: Your previous response was malformed. Ensure you return valid .mdx content starting with YAML frontmatter (---).';
                continue;
            }

            throw err;
        }
    }

    throw new Error('Exhausted all retries');
}

// ---------------------------------------------------------------------------
// Write doc file
// ---------------------------------------------------------------------------
/** @spec HELP-GEN-007 */
function writeDoc(entry, content) {
    const outPath = assertInsideDir(PATHS.docs_dir, resolve(PATHS.docs_dir, entry.output_path));
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, sanitizeGeneratedMdx(content), 'utf-8');
    return outPath;
}

function assertInsideDir(baseDir, targetPath) {
    const base = resolve(baseDir);
    const target = resolve(targetPath);
    const rel = relative(base, target);
    if (rel.startsWith('..') || isAbsolute(rel)) {
        throw new Error(`Refusing to write outside docs directory: ${targetPath}`);
    }
    return target;
}

function sanitizeGeneratedMdx(content) {
    const normalized = String(content).replace(/\r\n?/g, '\n').trim();
    if (/<script\b/i.test(normalized)) {
        throw new Error('Generated docs must not contain script tags');
    }
    if (/\son[a-z]+\s*=/i.test(normalized)) {
        throw new Error('Generated docs must not contain inline event handlers');
    }
    return normalized;
}

// ---------------------------------------------------------------------------
// Update astro.config.mjs sidebar
// ---------------------------------------------------------------------------
/** @spec HELP-GEN-008 */
function updateAstroConfig(manifest) {
    const sidebar = buildSidebarConfig(manifest);
    const sidebarJs = serializeSidebar(sidebar, 4);

    const config = `// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
\tintegrations: [
\t\tstarlight({
\t\t\ttitle: 'Producer Dashboard',
\t\t\tdescription: 'Help documentation for Producer Dashboard — the music production management platform.',
\t\t\tcustomCss: ['./src/styles/custom.css'],
\t\t\tsidebar: ${sidebarJs},
\t\t}),
\t],
});
`;

    writeFileSync(PATHS.astro_config, config, 'utf-8');
}

/** @spec HELP-GEN-008a */
function serializeSidebar(sidebar, baseIndent) {
    const t = '\t';
    const lines = [];
    lines.push('[');
    for (let si = 0; si < sidebar.length; si++) {
        const section = sidebar[si];
        lines.push(`${t.repeat(baseIndent)}{`);
        lines.push(`${t.repeat(baseIndent + 1)}label: ${quoteJsString(section.label)},`);
        lines.push(`${t.repeat(baseIndent + 1)}items: [`);
        for (let ii = 0; ii < section.items.length; ii++) {
            const item = section.items[ii];
            if (item.slug !== undefined) {
                lines.push(`${t.repeat(baseIndent + 2)}{ slug: ${quoteJsString(item.slug)} },`);
            } else if (item.items) {
                // Nested group
                lines.push(`${t.repeat(baseIndent + 2)}{`);
                lines.push(`${t.repeat(baseIndent + 3)}label: ${quoteJsString(item.label)},`);
                lines.push(`${t.repeat(baseIndent + 3)}items: [`);
                for (const child of item.items) {
                    lines.push(`${t.repeat(baseIndent + 4)}{ slug: ${quoteJsString(child.slug)} },`);
                }
                lines.push(`${t.repeat(baseIndent + 3)}],`);
                lines.push(`${t.repeat(baseIndent + 2)}},`);
            }
        }
        lines.push(`${t.repeat(baseIndent + 1)}],`);
        lines.push(`${t.repeat(baseIndent)}},`);
    }
    lines.push(`${t.repeat(baseIndent - 1)}]`);
    return lines.join('\n');
}

function quoteJsString(str) {
    return JSON.stringify(String(str));
}

// ---------------------------------------------------------------------------
// Write generation report
// ---------------------------------------------------------------------------
/** @spec HELP-GEN-009 */
function writeReport(results, startTime, model) {
    const elapsed = (Date.now() - startTime) / 1000;
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    const totalInput = successes.reduce((s, r) => s + (r.usage?.prompt_tokens || 0), 0);
    const totalOutput = successes.reduce((s, r) => s + (r.usage?.completion_tokens || 0), 0);

    // Pricing for minimax/minimax-m2.7 (per OpenRouter): $0.5/M input, $1.5/M output
    const inputCost = (totalInput / 1_000_000) * 0.5;
    const outputCost = (totalOutput / 1_000_000) * 1.5;

    const report = {
        timestamp: new Date().toISOString(),
        model,
        total_docs: results.length,
        successful: successes.length,
        failed: failures.length,
        failures: failures.map((f) => ({ doc_id: f.doc_id, reason: f.error })),
        tokens: { input: totalInput, output: totalOutput },
        cost: {
            input: `$${inputCost.toFixed(4)}`,
            output: `$${outputCost.toFixed(4)}`,
            total: `$${(inputCost + outputCost).toFixed(4)}`,
        },
        elapsed_seconds: Math.round(elapsed),
    };

    const reportPath = resolve(PATHS.root, 'generation-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    return report;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
/** @spec HELP-GEN-010 */
async function main() {
    const startTime = Date.now();
    const args = parseArgs(process.argv);
    const jobs = loadManifest(args);

    if (jobs.length === 0) {
        console.log('No docs matched the given filters.');
        process.exit(0);
    }

    // Load full manifest for sidebar + related docs
    const fullManifest = JSON.parse(
        readFileSync(resolve(PATHS.root, 'doc-manifest.json'), 'utf-8')
    );

    // Snapshot exemplars before generation
    const exemplars = snapshotExemplars();

    // Concurrency state (mutable, shared)
    let currentConcurrency = args.concurrency;
    const retryState = {
        halveConcurrency() {
            currentConcurrency = Math.max(1, Math.floor(currentConcurrency / 2));
        },
        getConcurrency() {
            return currentConcurrency;
        },
    };

    // Header
    console.log('');
    console.log('=== Producer Dashboard Help Docs Generator ===');
    console.log(`  Model:       ${OPENROUTER.model}`);
    console.log(`  Jobs:        ${jobs.length}`);
    console.log(`  Concurrency: ${currentConcurrency}`);
    console.log(`  Dry run:     ${args.dryRun}`);
    console.log('');

    // Dry run — just list what would be generated
    if (args.dryRun) {
        console.log('Dry run — no API calls will be made.\n');
        for (const entry of jobs) {
            const outPath = resolve(PATHS.docs_dir, entry.output_path);
            console.log(`  [DRY] ${entry.doc_id}`);
            console.log(`         -> ${outPath}`);
            console.log(`         specs: ${entry.spec_files.length}, code: ${entry.code_files.length}, screenshots: ${entry.screenshots.length}`);
        }
        console.log(`\n${jobs.length} doc(s) would be generated.`);
        return;
    }

    // Process jobs
    const results = [];

    async function processJob(entry) {
        try {
            const userPrompt = buildUserPrompt(entry, fullManifest, exemplars);
            const { content, usage } = await callOpenRouter(userPrompt, retryState);

            // Validate response
            const validation = validateResponse(content, entry, fullManifest.map((e) => e.doc_id));
            if (!validation.valid) {
                // Retry once with validation feedback
                console.log(`  Validation failed for ${entry.doc_id}: ${validation.errors.join(', ')}`);
                const retryPrompt =
                    userPrompt +
                    `\n\nIMPORTANT: Your previous response had these issues: ${validation.errors.join('; ')}. Please fix them.`;
                const retry = await callOpenRouter(retryPrompt, retryState);
                const retryValidation = validateResponse(retry.content, entry, fullManifest.map((e) => e.doc_id));

                if (!retryValidation.valid) {
                    console.log(`  FAILED ${entry.doc_id} — validation: ${retryValidation.errors.join(', ')}`);
                    results.push({
                        doc_id: entry.doc_id,
                        success: false,
                        error: `Validation: ${retryValidation.errors.join('; ')}`,
                    });
                    return;
                }

                writeDoc(entry, retry.content);
                const totalTokens = (usage.prompt_tokens || 0) + (usage.completion_tokens || 0) +
                    (retry.usage.prompt_tokens || 0) + (retry.usage.completion_tokens || 0);
                console.log(`  OK ${entry.doc_id} (${totalTokens} tokens, retry)`);
                results.push({
                    doc_id: entry.doc_id,
                    success: true,
                    usage: {
                        prompt_tokens: (usage.prompt_tokens || 0) + (retry.usage.prompt_tokens || 0),
                        completion_tokens: (usage.completion_tokens || 0) + (retry.usage.completion_tokens || 0),
                    },
                });
                return;
            }

            writeDoc(entry, content);
            const totalTokens = (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
            console.log(`  OK ${entry.doc_id} (${totalTokens} tokens)`);
            results.push({
                doc_id: entry.doc_id,
                success: true,
                usage,
            });
        } catch (err) {
            console.log(`  FAILED ${entry.doc_id} — ${err.message}`);
            results.push({
                doc_id: entry.doc_id,
                success: false,
                error: err.message,
            });
        }
    }

    // Parallel execution with captured batch size
    let i = 0;
    while (i < jobs.length) {
        const batchSize = currentConcurrency;
        const batch = jobs.slice(i, i + batchSize);
        await Promise.all(batch.map(processJob));
        i += batchSize;
        console.log(`  Progress: ${Math.min(i, jobs.length)}/${jobs.length}`);
    }

    // Update sidebar
    console.log('\nUpdating astro.config.mjs sidebar...');
    updateAstroConfig(fullManifest);
    console.log('  Sidebar updated.');

    // Write report
    const report = writeReport(results, startTime, OPENROUTER.model);

    // Summary
    console.log('\n=== Summary ===');
    console.log(`  Successful: ${report.successful}`);
    console.log(`  Failed:     ${report.failed}`);
    console.log(`  Tokens:     ${report.tokens.input} in / ${report.tokens.output} out`);
    console.log(`  Cost:       ${report.cost.total}`);
    console.log(`  Elapsed:    ${report.elapsed_seconds}s`);

    if (report.failures.length > 0) {
        console.log('\n  Failed docs:');
        for (const f of report.failures) {
            console.log(`    - ${f.doc_id}: ${f.reason}`);
        }
        console.log('\n  Hint: re-run with --failures-only to retry just the failures.');
    }

    console.log('');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
