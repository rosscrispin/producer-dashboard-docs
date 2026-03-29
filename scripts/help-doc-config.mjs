/**
 * @copyright 2025 Glimbr Pty Ltd
 * @spec HELP-CFG-001
 * @version 2026-03-29-v1
 */

import 'dotenv/config';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// OpenRouter settings
// ---------------------------------------------------------------------------
export const OPENROUTER = {
    api_key: process.env.OPENROUTER_API_KEY,
    model: 'minimax/minimax-m2.7',
    concurrency: 100,
    temperature: 0.3,
    max_tokens: 12000,
    backoff: {
        initial_delay_ms: 1000,
        max_delay_ms: 30000,
        max_retries: 3,
        factor: 2,
    },
};

// ---------------------------------------------------------------------------
// Path constants
// ---------------------------------------------------------------------------
export const PATHS = {
    root: ROOT,
    specs_dir: resolve(ROOT, 'docs/specs'),
    deep_dive_dir: resolve(ROOT, 'docs/specs/reference'),
    code_dirs: [
        resolve(ROOT, 'public/widgets'),
        resolve(ROOT, 'public/components'),
        resolve(ROOT, 'public/modules'),
        resolve(ROOT, 'public/modals'),
        resolve(ROOT, 'public'),
    ],
    docs_dir: resolve(ROOT, 'starlight/src/content/docs'),
    screenshots_dir: resolve(ROOT, 'starlight/src/assets/screenshots'),
    astro_config: resolve(ROOT, 'starlight/astro.config.mjs'),
};

// ---------------------------------------------------------------------------
// SVG placeholder template
// ---------------------------------------------------------------------------
function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function svgPlaceholder(id, description) {
    const safeId = escapeXml(id);
    const safeDesc = escapeXml(description);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <rect width="800" height="450" fill="#12121a" rx="8"/>
  <rect x="20" y="20" width="760" height="410" rx="6" fill="none"
        stroke="rgba(255,255,255,0.12)" stroke-width="2" stroke-dasharray="8,4"/>
  <text x="400" y="200" text-anchor="middle" fill="rgba(255,255,255,0.4)"
        font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="500">
    Screenshot needed
  </text>
  <text x="400" y="235" text-anchor="middle" fill="rgba(255,255,255,0.25)"
        font-family="Inter, system-ui, sans-serif" font-size="13">
    ${safeId}
  </text>
  <text x="400" y="260" text-anchor="middle" fill="rgba(255,255,255,0.20)"
        font-family="Inter, system-ui, sans-serif" font-size="12">
    ${safeDesc}
  </text>
</svg>`;
}

// ---------------------------------------------------------------------------
// System prompt for doc generation
// ---------------------------------------------------------------------------
export const SYSTEM_PROMPT = `You are a technical writer for Producer Dashboard, a music production management desktop app.

Write help documentation in a conversational, friendly tone. Address the reader as "you".

Output format requirements:
- Starlight .mdx format
- Start with YAML frontmatter containing "title" and "description" fields
- Use h2 (##) for main sections and h3 (###) for subsections
- Include a "Tips" section with practical advice using Starlight's tip admonition syntax
- End with a "Related" section linking to other relevant docs
- Target 800-1500 words

Content rules:
- Explain features from the user's perspective — what they do, why they matter, how to use them
- Never expose code internals, function names, class names, or implementation details
- Use concrete examples relevant to music producers
- When describing UI, reference what the user sees (buttons, panels, menus) not what the code does
- Keep paragraphs short (2-4 sentences)
- Use bullet lists for steps and feature lists

CRITICAL formatting rules:
- Output the raw .mdx content DIRECTLY — do NOT wrap it in markdown code fences
- Your response must start exactly with --- (the YAML frontmatter opening)
- Do NOT start with \`\`\`mdx or \`\`\`markdown or any other code fence
- The very first characters of your response must be: ---`;

// ---------------------------------------------------------------------------
// Screenshot rules by feature type
// ---------------------------------------------------------------------------
export const SCREENSHOT_RULES = {
    widget: {
        hint: 'Capture the widget in the activity panel with sample data visible',
        recommended_count: 2,
    },
    settings: {
        hint: 'Capture the full settings section with typical configuration',
        recommended_count: 2,
    },
    modal: {
        hint: 'Capture the modal dialog open with sample content',
        recommended_count: 1,
    },
    grid: {
        hint: 'Capture the tracks grid showing the feature in context',
        recommended_count: 2,
    },
    dashboard: {
        hint: 'Capture the dashboard section with representative data',
        recommended_count: 2,
    },
    workflow: {
        hint: 'Capture the workflow or stage UI with multiple states visible',
        recommended_count: 3,
    },
    overview: {
        hint: 'Capture a broad view showing the feature area in full context',
        recommended_count: 2,
    },
    guide: {
        hint: 'Capture key steps in the workflow being described',
        recommended_count: 3,
    },
};

// ---------------------------------------------------------------------------
// DOC_MAP — 122 entries
// ---------------------------------------------------------------------------
export const DOC_MAP = [
    // ── Getting Started (7) ────────────────────────────────────────────
    {
        doc_id: 'getting-started/index',
        title: 'Getting Started',
        section: 'Getting Started',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'getting-started/download-and-install',
        title: 'Download & Install',
        section: 'Getting Started',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'getting-started/creating-your-account',
        title: 'Creating Your Account',
        section: 'Getting Started',
        spec_files: ['AUTH_SPEC.md', 'AUTH_PAGE_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'getting-started/quick-start',
        title: 'Quick Start',
        section: 'Getting Started',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: ['onboarding.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'getting-started/your-first-import',
        title: 'Your First Import',
        section: 'Getting Started',
        spec_files: ['IMP_SPEC.md'],
        spec_sections: [],
        code_files: ['import-files-dialog.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'getting-started/your-first-project',
        title: 'Your First Project',
        section: 'Getting Started',
        spec_files: ['BKT_SPEC.md'],
        spec_sections: [],
        code_files: ['bucket-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'getting-started/quick-tour',
        title: 'Quick Tour',
        section: 'Getting Started',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'overview',
    },

    // ── Managing Your Music (9) ────────────────────────────────────────
    {
        doc_id: 'managing-your-music/songs-and-track-groups',
        title: 'Songs & Track Groups',
        section: 'Managing Your Music',
        spec_files: ['TRK_SPEC.md'],
        spec_sections: [],
        code_files: ['tracks-vanilla-table.js'],
        feature_type: 'overview',
    },
    {
        doc_id: 'managing-your-music/the-tracks-grid',
        title: 'The Tracks Grid',
        section: 'Managing Your Music',
        spec_files: ['TRK_SPEC.md'],
        spec_sections: [],
        code_files: ['tracks-vanilla-table.js'],
        feature_type: 'grid',
    },
    {
        doc_id: 'managing-your-music/importing-tracks',
        title: 'Importing Tracks',
        section: 'Managing Your Music',
        spec_files: ['IMP_SPEC.md', 'SEED_SPEC.md'],
        spec_sections: [],
        code_files: ['import-files-dialog.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'managing-your-music/editing-track-details',
        title: 'Editing Track Details',
        section: 'Managing Your Music',
        spec_files: ['TRK_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'managing-your-music/searching-and-filtering',
        title: 'Searching & Filtering',
        section: 'Managing Your Music',
        spec_files: ['TRK_SPEC.md'],
        spec_sections: [],
        code_files: ['filter-manager.js'],
        feature_type: 'grid',
    },
    {
        doc_id: 'managing-your-music/playing-and-previewing',
        title: 'Playing & Previewing',
        section: 'Managing Your Music',
        spec_files: ['AUD_SPEC.md'],
        spec_sections: [],
        code_files: ['audio-player.js'],
        feature_type: 'overview',
    },
    {
        doc_id: 'managing-your-music/saved-searches',
        title: 'Saved Searches',
        section: 'Managing Your Music',
        spec_files: ['TRK_SPEC.md'],
        spec_sections: [],
        code_files: ['recent-searches.js'],
        feature_type: 'grid',
    },
    {
        doc_id: 'managing-your-music/bulk-editing',
        title: 'Bulk Editing',
        section: 'Managing Your Music',
        spec_files: ['BULK_APPLY_BEHAVIOR_SPEC.md'],
        spec_sections: [],
        code_files: ['bulk-edit-manager.js', 'bulk-apply-modes.js'],
        feature_type: 'grid',
    },
    {
        doc_id: 'managing-your-music/column-management',
        title: 'Column Management',
        section: 'Managing Your Music',
        spec_files: ['TRK_SPEC.md'],
        spec_sections: [],
        code_files: ['column-manager.js', 'column-resizer.js'],
        feature_type: 'grid',
    },

    // ── Projects (5) ──────────────────────────────────────────────────
    {
        doc_id: 'projects/creating-projects',
        title: 'Creating Projects',
        section: 'Projects',
        spec_files: ['BKT_SPEC.md'],
        spec_sections: [],
        code_files: ['bucket-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'projects/project-hierarchy',
        title: 'Project Hierarchy',
        section: 'Projects',
        spec_files: ['BKT_SPEC.md'],
        spec_sections: [],
        code_files: ['bucket-widget.js'],
        feature_type: 'overview',
    },
    {
        doc_id: 'projects/assigning-songs',
        title: 'Assigning Songs',
        section: 'Projects',
        spec_files: ['BKT_SPEC.md'],
        spec_sections: [],
        code_files: ['bucket-assignment-service.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'projects/project-due-dates',
        title: 'Project Due Dates',
        section: 'Projects',
        spec_files: ['BKT_SPEC.md'],
        spec_sections: [],
        code_files: ['due-date-manager.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'projects/multi-project-selection',
        title: 'Multi-Project Selection',
        section: 'Projects',
        spec_files: ['BKT_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },

    // ── Workflow & Stages (4) ─────────────────────────────────────────
    {
        doc_id: 'workflow-and-stages/understanding-stages',
        title: 'Understanding Stages',
        section: 'Workflow & Stages',
        spec_files: ['TRK_SPEC.md'],
        spec_sections: [],
        code_files: ['stage-workflow-manager.js'],
        feature_type: 'workflow',
    },
    {
        doc_id: 'workflow-and-stages/custom-workflows',
        title: 'Custom Workflows',
        section: 'Workflow & Stages',
        spec_files: ['TRK_SPEC.md'],
        spec_sections: [],
        code_files: ['workflow-widget.js'],
        feature_type: 'workflow',
    },
    {
        doc_id: 'workflow-and-stages/tracking-progress',
        title: 'Tracking Progress',
        section: 'Workflow & Stages',
        spec_files: ['TRK_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'workflow',
    },
    {
        doc_id: 'workflow-and-stages/due-dates-and-deadlines',
        title: 'Due Dates & Deadlines',
        section: 'Workflow & Stages',
        spec_files: ['BKT_SPEC.md'],
        spec_sections: [],
        code_files: ['due-date-manager.js'],
        feature_type: 'workflow',
    },

    // ── Tags & Metadata (4) ──────────────────────────────────────────
    {
        doc_id: 'tags-and-metadata/using-tags',
        title: 'Using Tags',
        section: 'Tags & Metadata',
        spec_files: ['TAG_SPEC.md'],
        spec_sections: [],
        code_files: ['inline-tags-editor.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'tags-and-metadata/managing-tags-and-categories',
        title: 'Managing Tags & Categories',
        section: 'Tags & Metadata',
        spec_files: ['TAG_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'settings',
    },
    {
        doc_id: 'tags-and-metadata/musical-attributes',
        title: 'Musical Attributes',
        section: 'Tags & Metadata',
        spec_files: ['AUD_SPEC.md'],
        spec_sections: [],
        code_files: ['musical-attributes-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'tags-and-metadata/audio-analysis',
        title: 'Audio Analysis',
        section: 'Tags & Metadata',
        spec_files: ['AUD_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },

    // ── Audio Player (7) ─────────────────────────────────────────────
    {
        doc_id: 'audio-player/the-waveform-player',
        title: 'The Waveform Player',
        section: 'Audio Player',
        spec_files: ['AUD_SPEC.md'],
        spec_sections: [],
        code_files: ['audio-player.js'],
        feature_type: 'overview',
    },
    {
        doc_id: 'audio-player/playback-controls',
        title: 'Playback Controls',
        section: 'Audio Player',
        spec_files: ['AUD_SPEC.md'],
        spec_sections: [],
        code_files: ['audio-player.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'audio-player/playback-modes',
        title: 'Playback Modes',
        section: 'Audio Player',
        spec_files: ['AUD_SPEC.md'],
        spec_sections: [],
        code_files: ['play-on-select-manager.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'audio-player/waveform-interactions',
        title: 'Waveform Interactions',
        section: 'Audio Player',
        spec_files: ['AUD_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'audio-player/versions-and-stems',
        title: 'Versions & Stems',
        section: 'Audio Player',
        spec_files: ['AUD_SPEC.md'],
        spec_sections: [],
        code_files: ['files-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'audio-player/player-contexts',
        title: 'Player Contexts',
        section: 'Audio Player',
        spec_files: ['AUD_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'audio-player/supported-formats',
        title: 'Supported Formats',
        section: 'Audio Player',
        spec_files: ['AUD_SPEC.md', 'IMP_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },

    // ── Comments & Todos (9) ─────────────────────────────────────────
    {
        doc_id: 'comments-and-todos/adding-comments',
        title: 'Adding Comments',
        section: 'Comments & Todos',
        spec_files: ['CMT_SPEC.md'],
        spec_sections: [],
        code_files: ['comments-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'comments-and-todos/timestamped-comments',
        title: 'Timestamped Comments',
        section: 'Comments & Todos',
        spec_files: ['CMT_SPEC.md'],
        spec_sections: [],
        code_files: ['comments-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'comments-and-todos/pinning-comments',
        title: 'Pinning Comments',
        section: 'Comments & Todos',
        spec_files: ['CMT_SPEC.md'],
        spec_sections: [],
        code_files: ['comments-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'comments-and-todos/editing-and-deleting-comments',
        title: 'Editing & Deleting Comments',
        section: 'Comments & Todos',
        spec_files: ['CMT_SPEC.md'],
        spec_sections: [],
        code_files: ['comments-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'comments-and-todos/comments-on-shared-tracks',
        title: 'Comments on Shared Tracks',
        section: 'Comments & Todos',
        spec_files: ['CMT_SPEC.md', 'SHR_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'comments-and-todos/creating-todos',
        title: 'Creating Todos',
        section: 'Comments & Todos',
        spec_files: ['TODO_SPEC.md'],
        spec_sections: [],
        code_files: ['todos-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'comments-and-todos/todo-properties',
        title: 'Todo Properties',
        section: 'Comments & Todos',
        spec_files: ['TODO_SPEC.md'],
        spec_sections: [],
        code_files: ['todos-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'comments-and-todos/managing-todos',
        title: 'Managing Todos',
        section: 'Comments & Todos',
        spec_files: ['TODO_SPEC.md'],
        spec_sections: [],
        code_files: ['todos-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'comments-and-todos/todos-in-your-workflow',
        title: 'Todos in Your Workflow',
        section: 'Comments & Todos',
        spec_files: ['TODO_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'workflow',
    },

    // ── Collaboration (7) ────────────────────────────────────────────
    {
        doc_id: 'collaboration/adding-collaborators',
        title: 'Adding Collaborators',
        section: 'Collaboration',
        spec_files: ['COL_SPEC.md'],
        spec_sections: [],
        code_files: ['collaborators-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'collaboration/splits-and-rights',
        title: 'Splits & Rights',
        section: 'Collaboration',
        spec_files: ['COL_SPEC.md'],
        spec_sections: [],
        code_files: ['collaborators-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'collaboration/sharing-with-collaborators',
        title: 'Sharing with Collaborators',
        section: 'Collaboration',
        spec_files: ['COL_SPEC.md', 'SHR_SPEC.md'],
        spec_sections: [],
        code_files: ['collaboration-invite-modal.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'collaboration/permissions',
        title: 'Permissions',
        section: 'Collaboration',
        spec_files: ['COL_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'collaboration/invitations',
        title: 'Invitations',
        section: 'Collaboration',
        spec_files: ['COL_SPEC.md'],
        spec_sections: [],
        code_files: ['collaboration-invite-modal.js'],
        feature_type: 'modal',
    },
    {
        doc_id: 'collaboration/default-project-collaborators',
        title: 'Default Project Collaborators',
        section: 'Collaboration',
        spec_files: ['COL_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'collaboration/unsharing-and-leaving',
        title: 'Unsharing & Leaving',
        section: 'Collaboration',
        spec_files: ['COL_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },

    // ── Sharing (13) ─────────────────────────────────────────────────
    {
        doc_id: 'sharing/index',
        title: 'Sharing Overview',
        section: 'Sharing',
        spec_files: ['SHR_SPEC.md'],
        spec_sections: [],
        code_files: ['share-manager.js'],
        feature_type: 'overview',
    },
    {
        doc_id: 'sharing/creating-share-links',
        title: 'Creating Share Links',
        section: 'Sharing',
        spec_files: ['SHR_SPEC.md'],
        spec_sections: [],
        code_files: ['share-manager.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'sharing/share-settings',
        title: 'Share Settings',
        section: 'Sharing',
        spec_files: ['SHR_SPEC.md'],
        spec_sections: [],
        code_files: ['share-manager.js'],
        feature_type: 'settings',
    },
    {
        doc_id: 'sharing/the-share-page',
        title: 'The Share Page',
        section: 'Sharing',
        spec_files: ['SHR_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'overview',
    },
    {
        doc_id: 'sharing/playlist-sharing',
        title: 'Playlist Sharing',
        section: 'Sharing',
        spec_files: ['SHR_SPEC.md'],
        spec_sections: [],
        code_files: ['playlist-share-modal.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'sharing/managing-share-links',
        title: 'Managing Share Links',
        section: 'Sharing',
        spec_files: ['SHR_SPEC.md'],
        spec_sections: [],
        code_files: ['sharing-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'sharing/tracking-engagement',
        title: 'Tracking Engagement',
        section: 'Sharing',
        spec_files: ['SHR_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'sharing/when-to-use-what',
        title: 'When to Use What',
        section: 'Sharing',
        spec_files: ['SHR_SPEC.md', 'COL_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'sharing/public-page/index',
        title: 'Public Page',
        section: 'Sharing',
        spec_files: ['PUB_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'overview',
    },
    {
        doc_id: 'sharing/public-page/setting-up',
        title: 'Setting Up Your Public Page',
        section: 'Sharing',
        spec_files: ['PUB_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'sharing/public-page/adding-content',
        title: 'Adding Content',
        section: 'Sharing',
        spec_files: ['PUB_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'sharing/public-page/visitor-experience',
        title: 'Visitor Experience',
        section: 'Sharing',
        spec_files: ['PUB_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'sharing/public-page/preview-and-publish',
        title: 'Preview & Publish',
        section: 'Sharing',
        spec_files: ['PUB_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },

    // ── Dashboard (6) ────────────────────────────────────────────────
    {
        doc_id: 'dashboard/index',
        title: 'Dashboard Overview',
        section: 'Dashboard',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: ['dashboard.js'],
        feature_type: 'dashboard',
    },
    {
        doc_id: 'dashboard/featured-projects',
        title: 'Featured Projects',
        section: 'Dashboard',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: ['dashboard.js'],
        feature_type: 'dashboard',
    },
    {
        doc_id: 'dashboard/mini-kanban',
        title: 'Mini Kanban',
        section: 'Dashboard',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: ['dashboard.js'],
        feature_type: 'dashboard',
    },
    {
        doc_id: 'dashboard/upcoming-deadlines',
        title: 'Upcoming Deadlines',
        section: 'Dashboard',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: ['dashboard.js'],
        feature_type: 'dashboard',
    },
    {
        doc_id: 'dashboard/abandoned-tracks',
        title: 'Abandoned Tracks',
        section: 'Dashboard',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: ['dashboard.js'],
        feature_type: 'dashboard',
    },
    {
        doc_id: 'dashboard/dashboard-vs-tracks',
        title: 'Dashboard vs Tracks',
        section: 'Dashboard',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },

    // ── Activity Panel (17) ──────────────────────────────────────────
    {
        doc_id: 'activity-panel/index',
        title: 'Activity Panel Overview',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'overview',
    },
    {
        doc_id: 'activity-panel/overview-widget',
        title: 'Overview Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['overview-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/artwork-widget',
        title: 'Artwork Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['artwork-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/comments-widget',
        title: 'Comments Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['comments-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/todos-widget',
        title: 'Todos Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['todos-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/tags-widget',
        title: 'Tags Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['tags-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/stage-workflow-widget',
        title: 'Stage & Workflow Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['stage-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/musical-attributes-widget',
        title: 'Musical Attributes Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['musical-attributes-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/files-widget',
        title: 'Files Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['files-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/collaborators-widget',
        title: 'Collaborators Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['collaborators-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/sharing-widget',
        title: 'Sharing Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['sharing-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/due-date-widget',
        title: 'Due Date Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['due-date-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/export-widget',
        title: 'Export Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['export-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/bucket-widget',
        title: 'Bucket Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['bucket-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/lyrics-widget',
        title: 'Lyrics Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['lyrics-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/track-warnings-widget',
        title: 'Track Warnings Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['track-warnings-widget.js'],
        feature_type: 'widget',
    },
    {
        doc_id: 'activity-panel/marketing-widget',
        title: 'Marketing Widget',
        section: 'Activity Panel',
        spec_files: ['WGT_SPEC.md'],
        spec_sections: [],
        code_files: ['marketing-widget.js'],
        feature_type: 'widget',
    },

    // ── Activity & Notifications (5) ─────────────────────────────────
    {
        doc_id: 'activity-and-notifications/the-activity-feed',
        title: 'The Activity Feed',
        section: 'Activity & Notifications',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: ['notification-panel.js'],
        feature_type: 'overview',
    },
    {
        doc_id: 'activity-and-notifications/smart-notifications',
        title: 'Smart Notifications',
        section: 'Activity & Notifications',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: ['notification-panel.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'activity-and-notifications/how-notifications-appear',
        title: 'How Notifications Appear',
        section: 'Activity & Notifications',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: ['notification-panel.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'activity-and-notifications/notification-settings',
        title: 'Notification Settings',
        section: 'Activity & Notifications',
        spec_files: ['SET_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'settings',
    },
    {
        doc_id: 'activity-and-notifications/daily-workflow',
        title: 'Daily Workflow',
        section: 'Activity & Notifications',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },

    // ── Licensing (5) ────────────────────────────────────────────────
    {
        doc_id: 'licensing/setting-up',
        title: 'Setting Up Licensing',
        section: 'Licensing',
        spec_files: ['LIC_SPEC.md'],
        spec_sections: [],
        code_files: ['licensing-settings.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'licensing/creating-license-types',
        title: 'Creating License Types',
        section: 'Licensing',
        spec_files: ['LIC_SPEC.md'],
        spec_sections: [],
        code_files: ['licensing-settings.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'licensing/pricing-your-beats',
        title: 'Pricing Your Beats',
        section: 'Licensing',
        spec_files: ['LIC_SPEC.md'],
        spec_sections: [],
        code_files: ['licensing-settings.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'licensing/purchase-flow',
        title: 'Purchase Flow',
        section: 'Licensing',
        spec_files: ['LIC_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'licensing/managing-sales',
        title: 'Managing Sales',
        section: 'Licensing',
        spec_files: ['LIC_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },

    // ── Export (3) ───────────────────────────────────────────────────
    {
        doc_id: 'export/split-sheets',
        title: 'Split Sheets',
        section: 'Export',
        spec_files: ['EXP_SPEC.md'],
        spec_sections: [],
        code_files: ['export-widget.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'export/track-metadata',
        title: 'Track Metadata',
        section: 'Export',
        spec_files: ['EXP_SPEC.md'],
        spec_sections: [],
        code_files: ['track-metadata-export.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'export/writer-roles-and-ipi',
        title: 'Writer Roles & IPI',
        section: 'Export',
        spec_files: ['EXP_SPEC.md', 'COL_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },

    // ── Settings (12) ────────────────────────────────────────────────
    {
        doc_id: 'settings/profile-and-avatar',
        title: 'Profile & Avatar',
        section: 'Settings',
        spec_files: ['SET_SPEC.md'],
        spec_sections: [],
        code_files: ['settings.js'],
        feature_type: 'settings',
    },
    {
        doc_id: 'settings/background-and-theme',
        title: 'Background & Theme',
        section: 'Settings',
        spec_files: ['SET_SPEC.md'],
        spec_sections: [],
        code_files: ['settings.js'],
        feature_type: 'settings',
    },
    {
        doc_id: 'settings/connected-accounts',
        title: 'Connected Accounts',
        section: 'Settings',
        spec_files: ['SET_SPEC.md'],
        spec_sections: [],
        code_files: ['settings.js'],
        feature_type: 'settings',
    },
    {
        doc_id: 'settings/connecting-dropbox',
        title: 'Connecting Dropbox',
        section: 'Settings',
        spec_files: ['DBX_SPEC.md'],
        spec_sections: [],
        code_files: ['dropbox-connection.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'settings/dropbox-for-teams',
        title: 'Dropbox for Teams',
        section: 'Settings',
        spec_files: ['DBX_SPEC.md'],
        spec_sections: [],
        code_files: ['dropbox-connection.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'settings/managing-dropbox-connection',
        title: 'Managing Dropbox Connection',
        section: 'Settings',
        spec_files: ['DBX_SPEC.md'],
        spec_sections: [],
        code_files: ['dropbox-connection.js'],
        feature_type: 'settings',
    },
    {
        doc_id: 'settings/how-files-are-organized',
        title: 'How Files Are Organized',
        section: 'Settings',
        spec_files: ['IMP_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'settings/billing-and-subscription',
        title: 'Billing & Subscription',
        section: 'Settings',
        spec_files: ['PAY_SPEC.md'],
        spec_sections: [],
        code_files: ['billing.js'],
        feature_type: 'settings',
    },
    {
        doc_id: 'settings/notifications',
        title: 'Notifications',
        section: 'Settings',
        spec_files: ['SET_SPEC.md'],
        spec_sections: [],
        code_files: ['settings.js'],
        feature_type: 'settings',
    },
    {
        doc_id: 'settings/social-media-links',
        title: 'Social Media Links',
        section: 'Settings',
        spec_files: ['SET_SPEC.md'],
        spec_sections: [],
        code_files: ['settings.js'],
        feature_type: 'settings',
    },
    {
        doc_id: 'settings/pro-ipi-info',
        title: 'PRO & IPI Info',
        section: 'Settings',
        spec_files: ['SET_SPEC.md'],
        spec_sections: [],
        code_files: ['settings.js'],
        feature_type: 'settings',
    },
    {
        doc_id: 'settings/account-management',
        title: 'Account Management',
        section: 'Settings',
        spec_files: ['AUTH_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'settings',
    },

    // ── AI Assistant (3) ─────────────────────────────────────────────
    {
        doc_id: 'ai-assistant/using-the-assistant',
        title: 'Using the Assistant',
        section: 'AI Assistant',
        spec_files: ['CHT_SPEC.md'],
        spec_sections: [],
        code_files: ['chat-assistant.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'ai-assistant/what-you-can-ask',
        title: 'What You Can Ask',
        section: 'AI Assistant',
        spec_files: ['CHT_SPEC.md'],
        spec_sections: [],
        code_files: ['chat-assistant.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'ai-assistant/example-queries',
        title: 'Example Queries',
        section: 'AI Assistant',
        spec_files: ['CHT_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },

    // ── Reference (5) ────────────────────────────────────────────────
    {
        doc_id: 'reference/keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        section: 'Reference',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: ['keyboard-shortcuts-manager.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'reference/plan-limits',
        title: 'Plan Limits',
        section: 'Reference',
        spec_files: ['PAY_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'reference/supported-file-formats',
        title: 'Supported File Formats',
        section: 'Reference',
        spec_files: ['AUD_SPEC.md', 'IMP_SPEC.md'],
        spec_sections: [],
        code_files: [],
        feature_type: 'guide',
    },
    {
        doc_id: 'reference/undo-redo',
        title: 'Undo & Redo',
        section: 'Reference',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: ['undo-redo-manager.js'],
        feature_type: 'guide',
    },
    {
        doc_id: 'reference/realtime-sync',
        title: 'Realtime Sync',
        section: 'Reference',
        spec_files: ['SYS_SPEC.md'],
        spec_sections: [],
        code_files: ['realtime-sync.js'],
        feature_type: 'guide',
    },
];
