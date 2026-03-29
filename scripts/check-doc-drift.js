#!/usr/bin/env node
/**
 * Documentation & Test Drift Detector
 *
 * @version 2026-02-04-v2
 * @changelog
 *   v1 - Initial implementation
 *   v2 - Added version header checking
 *   v3 - Added test drift detection (CODE_TO_TESTS_MAP)
 *   2026-02-02-v1 - Fixed waveform-player.js mapping to point to SYS_SPEC.md (was TRACKS_PAGE_SPEC.md which doesn't exist)
 *   2026-02-02-v2 - Added "spec touch" support: specs can be marked as reviewed with <!-- Reviewed: YYYY-MM-DD --> comment
 *   2026-02-04-v1 - Converted to ES module syntax
 *   2026-02-04-v2 - Skip deleted files in version header checks
 *
 * Checks:
 * 1. Source files modified without updating corresponding specs
 * 2. Source files modified without incrementing @version
 * 3. Source files modified without updating corresponding tests
 *
 * Run manually: node scripts/check-doc-drift.js
 * Or as pre-commit hook (see setup instructions below)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get today's date in local timezone (YYYY-MM-DD format)
function getLocalToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a spec file was "touched" - either:
 * 1. Modified in the current changeset
 * 2. Contains a "Reviewed: YYYY-MM-DD" comment with today's date
 * 3. Has an "Auto-Generated" or "Last Updated" date of today
 *
 * This allows developers to acknowledge they reviewed a spec without
 * needing to make substantive changes.
 */
function isSpecTouched(specPath, changedFiles) {
  // Check if spec was directly modified
  if (changedFiles.includes(specPath)) {
    return true;
  }

  // Check if spec contains today's review marker
  try {
    const fullPath = path.join(process.cwd(), specPath);
    if (!fs.existsSync(fullPath)) return false;

    const content = fs.readFileSync(fullPath, 'utf8');
    const today = getLocalToday();

    // Check for review comment: <!-- Reviewed: 2026-02-02 -->
    const reviewMatch = content.match(/<!--\s*Reviewed:\s*(\d{4}-\d{2}-\d{2})\s*-->/i);
    if (reviewMatch && reviewMatch[1] === today) {
      return true;
    }

    // Check for Auto-Generated date
    const autoGenMatch = content.match(/Auto-Generated:\s*(\d{4}-\d{2}-\d{2})/);
    if (autoGenMatch && autoGenMatch[1] === today) {
      return true;
    }

    // Check for Last Updated date
    const lastUpdatedMatch = content.match(/Last Updated:\s*(\d{4}-\d{2}-\d{2})/);
    if (lastUpdatedMatch && lastUpdatedMatch[1] === today) {
      return true;
    }

    // Check for @version with today's date
    const versionMatch = content.match(/@version\s+(\d{4}-\d{2}-\d{2})/);
    if (versionMatch && versionMatch[1] === today) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

// Source file → Documentation mapping
const FILE_TO_DOCS_MAP = {
  // Tracks system
  'public/tracks-page.js': ['docs/specs/TRK_SPEC.md', 'docs/specs/reference/TRACKS_MANAGERS_DEEP_DIVE.md'],
  'public/tracks-vanilla-table.js': ['docs/specs/TRK_SPEC.md', 'docs/specs/reference/TRACKS_MANAGERS_DEEP_DIVE.md'],
  'public/tracks-view-modes.js': ['docs/specs/TRK_SPEC.md'],
  'public/tracks-v2-click-manager.js': ['docs/specs/TRK_SPEC.md'],
  'public/keyboard-shortcuts-manager.js': ['docs/specs/SYS_SPEC.md'],
  'public/waveform-player.js': ['docs/specs/SYS_SPEC.md'],
  'public/realtime-sync.js': ['docs/integrity/audit-reports/TRACK_SYNC_INTEGRITY.md'],
  'src/webhooks/dropbox.js': ['docs/integrity/audit-reports/TRACK_SYNC_INTEGRITY.md'],
  'src/utils/track-file-processor-v2.js': ['docs/integrity/audit-reports/TRACK_SYNC_INTEGRITY.md'],
  
  // Dashboard system
  'public/dashboard.js': ['docs/specs/SYS_SPEC.md', 'docs/specs/reference/DASHBOARD_MANAGERS_DEEP_DIVE.md'],

  // Settings system
  'public/settings.js': ['docs/specs/SET_SPEC.md', 'docs/specs/reference/SETTINGS_MANAGERS_DEEP_DIVE.md'],
  'public/dropbox-connection.js': ['docs/specs/SET_SPEC.md', 'docs/specs/reference/SETTINGS_MANAGERS_DEEP_DIVE.md'],
  'public/billing.js': ['docs/specs/PAY_SPEC.md'],
  'src/integrations/dropbox.js': ['docs/specs/DBX_SPEC.md'],
  'src/stripe/index.js': ['docs/specs/PAY_SPEC.md'],

  // Onboarding system
  'public/onboarding.js': ['docs/specs/SYS_SPEC.md', 'docs/specs/reference/ONBOARDING_MANAGERS_DEEP_DIVE.md'],
  'src/users/onboarding.js': ['docs/specs/SYS_SPEC.md'],

  // Sharing system
  'public/share-track.js': ['docs/specs/SHR_SPEC.md', 'docs/specs/reference/SHARING_MANAGERS_DEEP_DIVE.md'],
  'public/share-playlist.js': ['docs/specs/SHR_SPEC.md'],
  'public/share-waveform-player.js': ['docs/integrity/audit-reports/SHARING_INTEGRITY.md'],
  'src/share/handler.js': ['docs/integrity/audit-reports/SHARING_INTEGRITY.md'],
  'src/share/playlist.js': ['docs/integrity/audit-reports/SHARING_INTEGRITY.md'],
  'src/tracks/sharing.js': ['docs/specs/COLLAB_SHARING_UNIFIED_SPEC.md', 'docs/specs/TRK_SPEC.md'],
  'src/cron/check-share-acceptance.js': ['docs/specs/COLLAB_SHARING_UNIFIED_SPEC.md', 'docs/specs/SYS_SPEC.md'],
  'src/collaborations/index.js': ['docs/specs/COLLAB_SHARING_UNIFIED_SPEC.md', 'docs/specs/COL_SPEC.md'],
  'src/track-groups/index.js': ['docs/specs/COLLAB_SHARING_UNIFIED_SPEC.md', 'docs/specs/TRK_SPEC.md'],
  'electron/local-file-scanner.js': ['docs/specs/COLLAB_SHARING_UNIFIED_SPEC.md'],
  'src/utils/folder-manager.js': ['docs/specs/COLLAB_SHARING_UNIFIED_SPEC.md'],
  
  // Auth system
  'public/components/header.js': ['docs/integrity/audit-reports/AUTH_INTEGRITY.md'],
  'src/apirouter.js': ['docs/specs/FEATURE_REGISTRY.md'], // Core API changes affect registry
};

// Source file → Test file mapping (pattern-based)
// Uses glob-like patterns: * matches any characters
const CODE_TO_TESTS_MAP = {
  // Sharing system - comprehensive E2E tests
  'public/share-track.js': ['tests/e2e/sharing/share-link-lifecycle.spec.js', 'tests/e2e/sharing/comments-crud.spec.js'],
  'public/share-track.html': ['tests/e2e/sharing/share-link-lifecycle.spec.js'],
  'public/share-playlist.js': ['tests/e2e/sharing/playlist-sharing.spec.js'],
  'public/share-playlist.html': ['tests/e2e/sharing/playlist-sharing.spec.js'],
  'public/share-waveform-player.js': ['tests/e2e/sharing/comments-crud.spec.js'],
  'src/share/handler.js': ['tests/e2e/sharing/share-link-lifecycle.spec.js'],
  'src/share/playlist.js': ['tests/e2e/sharing/playlist-sharing.spec.js'],
  'src/api/comments.js': ['tests/e2e/sharing/comments-crud.spec.js'],
  'src/tracks/sharing.js': ['tests/test-collaborator-removal.js', 'tests/e2e/comprehensive/08-share-page.spec.js'],
  'src/cron/check-share-acceptance.js': ['tests/test-collaborator-removal.js'],
  'src/collaborations/index.js': ['tests/e2e/comprehensive/08-share-page.spec.js'],
  'src/track-groups/index.js': ['tests/e2e/comprehensive/08-share-page.spec.js', 'tests/e2e/comprehensive/09-comment-todo.spec.js'],
  'electron/local-file-scanner.js': ['tests/e2e/import/file-operations-lifecycle.spec.js'],
  'src/utils/folder-manager.js': ['tests/e2e/import/file-operations-lifecycle.spec.js'],
  
  // Tracks system
  'public/tracks-page.js': ['tests/test-selection-all-views.js', 'tests/test-filters-comprehensive.js'],
  'public/tracks-vanilla-table.js': ['tests/browser/test-vanilla-table.js'],
  'public/waveform-player.js': ['tests/test-waveform-cache.js', 'tests/test-waveform-comments.js'],
  'public/realtime-sync.js': ['tests/test-dropbox-sync.js'],
  'src/webhooks/dropbox.js': ['tests/test-dropbox-sync.js', 'tests/file-management/test-first-file-addition.js'],
  'src/utils/track-file-processor-v2.js': ['tests/file-management/test-first-file-addition.js'],
  
  // Dashboard system
  'public/dashboard.js': ['tests/browser/test-dashboard-loading.js', 'tests/browser/test-dashboard-kanban-scrolling.js'],
  
  // Kanban/drag functionality
  'public/kanban-board.js': ['tests/test-kanban-drag-detailed.js', 'tests/test-kanban-bucket-final.js'],
  
  // Bucket/project system
  'public/tracks-projects.js': ['tests/e2e/buckets/bucket-nesting-lifecycle.spec.js', 'tests/e2e/buckets/bucket-track-groups.spec.js'],
  'public/bucket-drag-drop.js': ['tests/e2e/buckets/bucket-track-groups.spec.js'],
  'public/track-group-merge.js': ['tests/e2e/buckets/bucket-track-groups.spec.js'],
  'public/modals/bucket-assignment-modal.js': ['tests/e2e/buckets/bucket-track-groups.spec.js'],
  'public/inline-bucket-dropdown.js': ['tests/e2e/buckets/bucket-track-groups.spec.js'],
  
  // Grid view / vanilla table
  'public/tracks-vanilla-table.js': ['tests/e2e/grid/inline-editing.spec.js', 'tests/e2e/grid/bulk-operations.spec.js', 'tests/e2e/grid/drag-drop-mutations.spec.js'],
  'public/tracks-view-modes.js': ['tests/e2e/grid/inline-editing.spec.js', 'tests/e2e/grid/drag-drop-mutations.spec.js'],
  'public/selection-manager.js': ['tests/e2e/grid/bulk-operations.spec.js'],
  'public/inline-stage-dropdown.js': ['tests/e2e/grid/inline-editing.spec.js'],
  'public/due-date-manager.js': ['tests/e2e/grid/inline-editing.spec.js'],
};

// Check if any test file in the list (or its directory) was modified
function checkTestsUpdated(testFiles, changedFiles) {
  for (const testFile of testFiles) {
    // Direct match
    if (changedFiles.includes(testFile)) return true;
    
    // Check if any file in the same test directory was updated
    const testDir = path.dirname(testFile);
    for (const changed of changedFiles) {
      if (changed.startsWith(testDir + '/')) return true;
    }
  }
  return false;
}

function getChangedFiles() {
  try {
    // Get staged files (for pre-commit) or all uncommitted changes
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
    const unstaged = execSync('git diff --name-only', { encoding: 'utf8' }).trim();
    const combined = `${staged}\n${unstaged}`.split('\n').filter(f => f.length > 0);
    return [...new Set(combined)]; // Dedupe
  } catch {
    return [];
  }
}

function getDeletedFiles() {
  try {
    // Get files that are staged for deletion
    const deleted = execSync('git diff --cached --name-only --diff-filter=D', { encoding: 'utf8' }).trim();
    return deleted.split('\n').filter(f => f.length > 0);
  } catch {
    return [];
  }
}

// Check if file has @version and if it was updated today
function checkVersionHeader(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return { hasVersion: false, isUpdated: false };
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const versionMatch = content.match(/@version\s+(\d{4}-\d{2}-\d{2})-v(\d+)/);
    
    if (!versionMatch) return { hasVersion: false, isUpdated: false };
    
    const today = getLocalToday();
    const fileDate = versionMatch[1];
    
    return { 
      hasVersion: true, 
      isUpdated: fileDate === today,
      currentVersion: `${fileDate}-v${versionMatch[2]}`
    };
  } catch {
    return { hasVersion: false, isUpdated: false };
  }
}

function checkDrift() {
  const changedFiles = getChangedFiles();
  const deletedFiles = getDeletedFiles();
  if (changedFiles.length === 0) {
    console.log('✅ No changed files detected.');
    return 0;
  }

  const docWarnings = [];
  const testWarnings = [];
  const versionWarnings = [];

  for (const file of changedFiles) {
    // Skip deleted files - they don't need version headers or doc updates
    if (deletedFiles.includes(file)) {
      continue;
    }

    // Check documentation drift
    const requiredDocs = FILE_TO_DOCS_MAP[file];
    if (requiredDocs) {
      for (const doc of requiredDocs) {
        if (!isSpecTouched(doc, changedFiles)) {
          docWarnings.push({ source: file, doc });
        }
      }
    }

    // Check test drift
    const requiredTests = CODE_TO_TESTS_MAP[file];
    if (requiredTests) {
      if (!checkTestsUpdated(requiredTests, changedFiles)) {
        testWarnings.push({ source: file, tests: requiredTests });
      }
    }

    // Check version header (only for .js files in public/ or src/)
    if (file.endsWith('.js') && (file.startsWith('public/') || file.startsWith('src/'))) {
      const versionStatus = checkVersionHeader(file);
      if (!versionStatus.hasVersion) {
        versionWarnings.push({ file, issue: 'Missing @version header' });
      } else if (!versionStatus.isUpdated) {
        versionWarnings.push({ file, issue: `Version not updated today (current: ${versionStatus.currentVersion})` });
      }
    }
  }

  let exitCode = 0;

  // Report documentation drift
  if (docWarnings.length > 0) {
    console.log('\n⚠️  DOCUMENTATION DRIFT DETECTED\n');
    console.log('The following source files were changed without updating their specs:\n');
    
    const grouped = {};
    for (const w of docWarnings) {
      if (!grouped[w.source]) grouped[w.source] = [];
      grouped[w.source].push(w.doc);
    }
    
    for (const [source, docs] of Object.entries(grouped)) {
      console.log(`  📄 ${source}`);
      for (const doc of docs) {
        console.log(`     └─ Missing update: ${doc}`);
      }
    }
    exitCode = 1;
  }

  // Report test drift
  if (testWarnings.length > 0) {
    console.log('\n🧪 TEST DRIFT DETECTED\n');
    console.log('The following source files were changed without updating their tests:\n');
    
    for (const w of testWarnings) {
      console.log(`  📄 ${w.source}`);
      for (const test of w.tests) {
        console.log(`     └─ Consider updating: ${test}`);
      }
    }
    // Test drift is a warning, not a blocker (exitCode stays same)
    console.log('\n   ℹ️  Test drift is a WARNING - verify tests still pass with: npm test');
  }

  // Report version warnings
  if (versionWarnings.length > 0) {
    console.log('\n⚠️  VERSION HEADER ISSUES\n');
    for (const w of versionWarnings) {
      console.log(`  📄 ${w.file}`);
      console.log(`     └─ ${w.issue}`);
    }
    exitCode = 1;
  }

  if (exitCode === 0 && testWarnings.length === 0) {
    console.log('✅ Documentation, tests, and versions are in sync.');
  } else if (exitCode === 0 && testWarnings.length > 0) {
    console.log('\n✅ Documentation and versions OK, but review test coverage above.');
  } else {
    console.log('\n💡 To fix:');
    if (docWarnings.length > 0) {
      const today = getLocalToday();
      console.log('   - Update spec files to reflect your code changes, OR');
      console.log('   - Add a review marker if no behavior changed:');
      console.log(`     <!-- Reviewed: ${today} -->`);
    }
    if (versionWarnings.length > 0) {
      console.log('   - Add/update @version header: @version ' + getLocalToday() + '-vN');
    }
    if (testWarnings.length > 0) {
      console.log('   - Update tests or run: npm run test:sharing');
    }
    console.log('   Or if intentional, proceed with --no-verify\n');
  }
  
  return exitCode;
}

// Run
const exitCode = checkDrift();
process.exit(exitCode);
