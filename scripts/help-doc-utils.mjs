/**
 * @copyright 2025 Glimbr Pty Ltd
 * @spec HELP-UTL-001
 * @version 2026-03-29-v1
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { PATHS } from './help-doc-config.mjs';

/** @spec HELP-UTL-002 */
export function extractSpecSections(specFilePath, sectionCodes) {
    if (!existsSync(specFilePath)) {
        return '';
    }
    const content = readFileSync(specFilePath, 'utf-8');

    if (!sectionCodes || sectionCodes.length === 0) {
        return content.slice(0, 16000);
    }

    const lines = content.split('\n');
    const extracted = [];

    for (const code of sectionCodes) {
        const pattern = new RegExp(`^#{2,4}\\s+${escapeRegex(code)}\\s*:`, 'i');
        let capturing = false;
        let capturedLines = [];
        let headerLevel = 0;

        for (const line of lines) {
            if (pattern.test(line)) {
                capturing = true;
                headerLevel = (line.match(/^#+/) || [''])[0].length;
                capturedLines.push(line);
                continue;
            }

            if (capturing) {
                const headingMatch = line.match(/^(#{2,4})\s/);
                if (headingMatch && headingMatch[1].length <= headerLevel) {
                    break;
                }
                capturedLines.push(line);
            }
        }

        if (capturedLines.length > 0) {
            extracted.push(capturedLines.join('\n'));
        }
    }

    return extracted.join('\n\n---\n\n').slice(0, 16000);
}

/** @spec HELP-UTL-003 */
export function resolveCodeFile(filename) {
    for (const dir of PATHS.code_dirs) {
        const fullPath = resolve(dir, filename);
        if (existsSync(fullPath)) {
            return fullPath;
        }
    }
    return null;
}

/** @spec HELP-UTL-004 */
export function readCodeFile(filename) {
    const filePath = resolveCodeFile(filename);
    if (!filePath) {
        return '';
    }
    return readFileSync(filePath, 'utf-8').slice(0, 16000);
}

/** @spec HELP-UTL-005 */
export function screenshotRelativePath(docId) {
    const depth = docId.split('/').length;
    const ups = '../'.repeat(depth);
    return `${ups}assets/screenshots`;
}

/** @spec HELP-UTL-006 */
export function validateResponse(text) {
    const errors = [];

    if (!text || typeof text !== 'string' || text.length < 50) {
        return { valid: false, errors: ['Response is empty or too short'] };
    }

    const frontmatterMatch = text.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
        errors.push('Missing YAML frontmatter');
    } else {
        const fm = frontmatterMatch[1];
        if (!/^title\s*:/m.test(fm)) errors.push('Frontmatter missing "title" field');
        if (!/^description\s*:/m.test(fm)) errors.push('Frontmatter missing "description" field');
    }

    const h2Count = (text.match(/^## /gm) || []).length;
    if (h2Count < 2) {
        errors.push(`Only ${h2Count} h2 section(s), need at least 2`);
    }

    const bodyText = text.replace(/^---[\s\S]*?---/, '').trim();
    const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
    if (wordCount < 500) {
        errors.push(`Only ${wordCount} words, need at least 500`);
    }

    const trimmed = text.trimEnd();
    const lastLine = trimmed.split('\n').pop().trim();
    if (lastLine.length < 5 && !lastLine.startsWith('#') && !lastLine.startsWith('-') && lastLine !== '---') {
        errors.push(`Appears truncated - last line is "${lastLine}"`);
    }

    return { valid: errors.length === 0, errors };
}

/** @spec HELP-UTL-007 */
export function buildSidebarConfig(docMap) {
    const sectionOrder = [];
    const sectionItems = {};

    for (const entry of docMap) {
        if (!sectionItems[entry.section]) {
            sectionOrder.push(entry.section);
            sectionItems[entry.section] = [];
        }
        sectionItems[entry.section].push(entry);
    }

    const sidebar = [];

    for (const section of sectionOrder) {
        const items = sectionItems[section];
        const sidebarItems = [];
        const nestedByGroup = {};
        const topLevel = [];

        for (const item of items) {
            const parts = item.doc_id.split('/');
            if (parts.length >= 3) {
                const groupKey = parts.slice(0, 2).join('/');
                if (!nestedByGroup[groupKey]) {
                    nestedByGroup[groupKey] = { index: null, children: [] };
                }
                if (parts[parts.length - 1] === 'index') {
                    nestedByGroup[groupKey].index = item;
                } else {
                    nestedByGroup[groupKey].children.push(item);
                }
            } else {
                topLevel.push(item);
            }
        }

        for (const item of topLevel) {
            const slug = stripIndexSlug(item.doc_id);
            const groupKey = item.doc_id.replace(/\/index$/, '');

            if (nestedByGroup[groupKey]) {
                const group = nestedByGroup[groupKey];
                const children = [{ slug }];
                if (group.index) children.push({ slug: stripIndexSlug(group.index.doc_id) });
                for (const child of group.children) {
                    children.push({ slug: stripIndexSlug(child.doc_id) });
                }
                sidebarItems.push({ label: item.title, items: children });
                delete nestedByGroup[groupKey];
            } else {
                sidebarItems.push({ slug });
            }
        }

        for (const [groupKey, group] of Object.entries(nestedByGroup)) {
            const label = group.index ? group.index.title : groupKey.split('/').pop();
            const children = [];
            if (group.index) children.push({ slug: stripIndexSlug(group.index.doc_id) });
            for (const child of group.children) {
                children.push({ slug: stripIndexSlug(child.doc_id) });
            }
            sidebarItems.push({ label, items: children });
        }

        sidebar.push({ label: section, items: sidebarItems });
    }

    return sidebar;
}

function stripIndexSlug(docId) {
    return docId.replace(/\/index$/, '');
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
