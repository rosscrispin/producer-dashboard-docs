/**
 * @copyright 2025 Glimbr Pty Ltd
 * @spec HELP-GEN-001
 * @version 2026-03-29-v1
 */

import { readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join, extname } from 'path';
import { DOC_MAP, SCREENSHOT_RULES, PATHS, svgPlaceholder } from './help-doc-config.mjs';
import { resolveCodeFile, screenshotRelativePath } from './help-doc-utils.mjs';

// ---------------------------------------------------------------------------
// Counters
// ---------------------------------------------------------------------------
let totalDocs = 0;
let totalScreenshots = 0;
let totalPlaceholders = 0;
let warnings = [];

// ---------------------------------------------------------------------------
// collectJsFiles — recursively gather all .js files from given directories
// ---------------------------------------------------------------------------
/** @spec HELP-GEN-002 */
function collectJsFiles(dirs) {
    const files = new Set();

    function walk(dir) {
        if (!existsSync(dir)) return;
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry);
            let stat;
            try {
                stat = statSync(full);
            } catch {
                continue;
            }
            if (stat.isDirectory()) {
                walk(full);
            } else if (extname(entry) === '.js') {
                files.add(entry);
            }
        }
    }

    for (const dir of dirs) {
        walk(dir);
    }

    return files;
}

// ---------------------------------------------------------------------------
// buildScreenshotEntries
// ---------------------------------------------------------------------------
/** @spec HELP-GEN-003 */
function buildScreenshotEntries(docEntry, rules) {
    const featureRules = rules[docEntry.feature_type];
    if (!featureRules) return [];

    const entries = [];
    const count = featureRules.recommended_count || 1;
    const lastSegment = docEntry.doc_id.split('/').pop();
    const section = docEntry.doc_id.split('/')[0];

    const suffixes = [
        'default',
        'active',
        'expanded',
        'alternate',
        'detail',
    ];

    for (let i = 0; i < count; i++) {
        const suffix = suffixes[i] || `state-${i + 1}`;
        const id = `${lastSegment}-${suffix}`;
        const filename = `${id}.svg`;

        const stateDescriptions = [
            `Widget in default state with a single track selected`,
            `Widget in active/expanded state showing full details`,
            `Widget with expanded content and multiple items`,
            `Widget showing alternate view or configuration`,
            `Widget showing detailed information panel`,
        ];

        entries.push({
            id,
            filename,
            section,
            description: `${docEntry.title}: ${stateDescriptions[i] || `State ${i + 1}`}`,
            app_state: `Tracks page, one track selected, activity panel open, widget tab active`,
            dimensions: '800x450',
        });
    }

    return entries;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
console.log('=== Doc Manifest Generator ===\n');

const docManifest = [];
const screenshotManifest = [];

for (const entry of DOC_MAP) {
    totalDocs++;
    console.log(`  [${totalDocs}/${DOC_MAP.length}] ${entry.doc_id}`);

    // Resolve code files
    const resolvedCodeFiles = [];
    for (const codeFile of entry.code_files) {
        const resolved = resolveCodeFile(codeFile);
        if (resolved) {
            resolvedCodeFiles.push(resolved);
        } else {
            const msg = `WARN: Code file not found: ${codeFile} (doc: ${entry.doc_id})`;
            warnings.push(msg);
            console.log(`    ${msg}`);
        }
    }

    // Resolve spec files
    const resolvedSpecFiles = entry.spec_files.map(sf =>
        resolve(PATHS.specs_dir, sf)
    );

    // Generate screenshot entries
    const screenshots = buildScreenshotEntries(entry, SCREENSHOT_RULES);
    totalScreenshots += screenshots.length;

    // Generate placeholder SVGs
    for (const ss of screenshots) {
        const ssDir = resolve(PATHS.screenshots_dir, ss.section);
        mkdirSync(ssDir, { recursive: true });

        const svgPath = resolve(ssDir, ss.filename);
        try {
            const svg = svgPlaceholder(ss.id, ss.description);
            writeFileSync(svgPath, svg, { encoding: 'utf-8', flag: 'wx' });
            totalPlaceholders++;
        } catch (err) {
            if (err.code !== 'EEXIST') throw err;
        }
    }

    // Add screenshot entries to the screenshot manifest
    for (const ss of screenshots) {
        screenshotManifest.push(ss);
    }

    // Build manifest entry
    docManifest.push({
        doc_id: entry.doc_id,
        output_path: `${entry.doc_id}.mdx`,
        title: entry.title,
        section: entry.section,
        feature_type: entry.feature_type,
        spec_files: resolvedSpecFiles,
        spec_sections: entry.spec_sections,
        code_files: resolvedCodeFiles,
        screenshots: screenshots.map(s => s.id),
        screenshot_relative_path: screenshotRelativePath(entry.doc_id),
    });
}

// ---------------------------------------------------------------------------
// Gap detection — find .js files not referenced in DOC_MAP
// ---------------------------------------------------------------------------
console.log('\n--- Gap Detection ---');

const referencedCodeFiles = new Set();
for (const entry of DOC_MAP) {
    for (const cf of entry.code_files) {
        referencedCodeFiles.add(cf);
    }
}

const allJsFiles = collectJsFiles(PATHS.code_dirs);
const unmappedFiles = [];
for (const file of allJsFiles) {
    if (!referencedCodeFiles.has(file)) {
        unmappedFiles.push(file);
    }
}

unmappedFiles.sort();

if (unmappedFiles.length > 0) {
    console.log(`  ${unmappedFiles.length} unmapped .js files (not referenced in DOC_MAP):`);
    for (const f of unmappedFiles.slice(0, 20)) {
        console.log(`    - ${f}`);
    }
    if (unmappedFiles.length > 20) {
        console.log(`    ... and ${unmappedFiles.length - 20} more`);
    }
} else {
    console.log('  All .js files are referenced in DOC_MAP');
}

// ---------------------------------------------------------------------------
// Write outputs
// ---------------------------------------------------------------------------
const docManifestPath = resolve(PATHS.root, 'doc-manifest.json');
const ssManifestPath = resolve(PATHS.root, 'screenshot-manifest.json');

writeFileSync(docManifestPath, JSON.stringify(docManifest, null, 2), 'utf-8');
console.log(`\nWrote: ${docManifestPath}`);

writeFileSync(ssManifestPath, JSON.stringify(screenshotManifest, null, 2), 'utf-8');
console.log(`Wrote: ${ssManifestPath}`);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n=== Summary ===');
console.log(`  ${totalDocs} doc entries`);
console.log(`  ${totalScreenshots} screenshots`);
console.log(`  ${totalPlaceholders} placeholder SVGs created`);
console.log(`  ${unmappedFiles.length} unmapped files`);
if (warnings.length > 0) {
    console.log(`  ${warnings.length} warnings`);
}
console.log('\nDone.');
