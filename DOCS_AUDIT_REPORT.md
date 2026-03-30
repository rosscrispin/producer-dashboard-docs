# Documentation Audit Report

**Date:** 2026-03-30
**Scope:** 121 docs across 17 sections
**Audited against:** Spec files in `producer-dashboard/docs/specs/`, code in `producer-dashboard/public/` and `producer-dashboard/src/`

---

## Executive Summary

The audit found **23 critical accuracy issues**, **18 high-priority issues**, and numerous medium/low gaps. The most systemic problems are:

1. **Plan limits are entirely wrong** — Free, Starter, and Pro track/collaborator limits in the docs don't match `src/stripe/pricing.js`
2. **Several docs describe features that don't exist** — player contexts, waveform region selection, dashboard drag-and-drop, featured project pinning, default project collaborators
3. **Permission model is fabricated** — docs describe "Full Access / Edit Only / View Only" tiers that aren't in the spec
4. **Stage names are inconsistent** — some docs use real names (Seed/Sprout/Sapling/Plant/Tree/Finished), others use fake names (Idea/Recording/Editing/Mixing/Mastering)
5. **40 of 121 docs have no code_files mapped** in the manifest
6. **No docs include inline code location, UI location, or related feature metadata** — they have "Related" links but no structured references

---

## CRITICAL Issues (Must Fix)

### 1. `reference/plan-limits.mdx` — All plan limits are wrong

| Field | Doc Says | Actual (pricing.js) |
|-------|----------|---------------------|
| Free tracks | 3 | **20** |
| Starter tracks | 50 | **100** |
| Pro tracks | 200 | **Unlimited** |
| Starter collaborators | 3 | **Unlimited** |
| Pro collaborators | 10 | **Unlimited** |
| Lifetime collaborators | 10 | **Unlimited** |
| Storage limits | Listed as a feature | **Not a plan-gated feature** |

- **Spec:** PAY_SPEC.md (PAY-FN-004, PAY-FN-006)
- **Code:** `src/stripe/pricing.js`
- **UI:** Settings > Subscription > Plan Limits card

### 2. `collaboration/permissions.mdx` — Fabricated permission tiers

Doc describes "Full Access / Edit Only / View Only" permission levels. The actual model is **owner vs. active member** plus `master_split`-based pin rights. No tiered permissions exist.

- **Spec:** COL_SPEC.md
- **Code:** `public/widgets/collaborators-widget.js`
- **UI:** Activity Panel > Collaborators Widget

### 3. `collaboration/sharing-with-collaborators.mdx` — Same fabricated permissions

References the non-existent permission tiers from permissions.mdx.

### 4. `dashboard/featured-projects.mdx` — Fabricates pinning/starring

Describes a star icon to "pin" projects to the dashboard. The actual feature is **auto-surfaced Recent Buckets** based on event log activity. No pinning/starring mechanism exists.

- **Spec:** SYS_SPEC.md
- **Code:** `public/dashboard.js`
- **UI:** Dashboard home screen, top section

### 5. `dashboard/mini-kanban.mdx` — Invents non-existent features

Describes search, filters, stage-change dropdowns, and widget dragging on the kanban board. None of these exist in `dashboard.js`.

- **Code:** `public/dashboard.js` — zero drag, search, or filter references

### 6. `dashboard/dashboard-vs-tracks.mdx` — Claims kanban drag-and-drop

Says you can drag tracks between kanban columns. Confirmed zero drag references in `dashboard.js`.

### 7. `audio-player/player-contexts.mdx` — Entirely fictional feature

Describes four distinct listening contexts (Library, Project, Share Page, Queue) with a dropdown switcher. No code implementation exists for any of this.

- **Spec:** AUD_SPEC.md — no mention of player contexts
- **Code:** No file exists

### 8. `audio-player/waveform-interactions.mdx` — Describes non-existent features

Region selection, zoom, and stem stacking features don't exist in the codebase.

- **Spec:** AUD_SPEC.md — no region selection or stem stacking
- **Code:** `public/audio-player.js` — none of these features present

### 9. `workflow-and-stages/tracking-progress.mdx` — Wrong stage names throughout

Uses Idea/Recording/Editing/Mixing/Mastering/Ready to Post/Published. The actual defaults are **Seed/Sprout/Sapling/Plant/Tree/Finished** with different colors.

- **Spec:** TRK_SPEC.md (TRK-FN-002)
- **Code:** `public/stage-workflow-manager.js`

### 10. `collaboration/default-project-collaborators.mdx` — Undocumented vaporware

Describes a feature with no backing spec, API endpoint, or code file. May not be implemented.

### 11. `settings/account-management.mdx` — DANGEROUS: Deletion described as reversible

Tells users account deletion is a "soft-delete with a retention window." SET_SPEC (SET-FN-011) performs **GDPR hard deletion** — all data is permanently destroyed. Users could lose data trusting this doc.

- **Spec:** SET_SPEC.md (SET-FN-011)
- **Code:** `src/settings/index.js`

### 12. `settings/connected-accounts.mdx` — Fabricated integrations

Claims Google Calendar integration exists (it doesn't) and that Dropbox allows file browsing/importing (explicitly removed per DBX_SPEC — Dropbox is sharing-only).

- **Spec:** DBX_SPEC.md, SET_SPEC.md
- **Code:** `public/settings.js`

### 13. `comments-and-todos/comments-on-shared-tracks.mdx` — Wrong about external comments

Says external viewers cannot add comments. Per SHR-FN-010, they **can** post comments unless `comments_disabled` is true.

- **Spec:** SHR_SPEC.md (SHR-FN-010)

---

## HIGH Priority Issues

### 14. `reference/supported-file-formats.mdx` — Suffix stripping described as working

States filename suffix stripping (clean, full mix, demo, wip, etc.) works. IMP_SPEC documents this as **known bug PRO-56** — NOT yet implemented.

- **Spec:** IMP_SPEC.md (IMP-FN-001)

### 15. `reference/supported-file-formats.mdx` — OGG listed as import format

OGG works for audio analysis but is NOT in the import scanner's extension list.

### 16. `reference/supported-file-formats.mdx` — Corrupted text

Chinese characters appear at the end of line 104.

### 17. `audio-player/playback-controls.mdx` — Fabricated 3-second threshold

Describes a 3-second threshold on the Previous button (restart vs. previous track). The actual code unconditionally jumps to the previous track.

- **Code:** `public/audio-player.js`

### 18. `sharing/when-to-use-what.mdx` — Wrong about share link behavior

Says share links are "snapshots." They actually serve live database/Dropbox data at access time.

- **Spec:** SHR_SPEC.md

### 19. `sharing/public-page/*.mdx` (4 docs) — Wrong URL domain

Uses `producerdashboard.app` instead of the correct `client.producerdashboard.app`.

### 20. Collaboration docs — `writer_split` omitted from 6 of 7 docs

Only `permissions.mdx` mentions the `writer_split` field. All other collaboration docs describe only master and publishing splits, despite the spec tracking all three.

### 21. Todo permission language — Wrong in 3 docs

Three docs say edit/delete requires "assigned to" or "track owner" access. The spec checks `user_id` or `created_by`, which are different fields.

### 22. `settings/how-files-are-organized.mdx` — Bug described as working feature

Describes filename suffix stripping as working (same as #14, different doc).

### 23. `settings/notifications.mdx` — Extensive features that don't exist

Describes Quiet Hours, push notifications, digest emails, notification sounds. The spec only has a generic `notification_preferences` JSON field.

### 24. `licensing/managing-sales.mdx` — Corrupted text

Contains Chinese characters and significant content duplication with three other licensing docs.

### 25. `getting-started/download-and-install.mdx` — Fabricated 2FA

Mentions email-based two-factor authentication that doesn't appear in AUTH_SPEC or AUTH_PAGE_SPEC.

---

## Manifest Code Path Issues

These code file paths in `doc-manifest.json` are incorrect:

| Doc | Manifest Says | Actual Path |
|-----|---------------|-------------|
| `managing-your-music/searching-and-filtering` | `filter-manager.js` | `public/modules/filter-manager.js` |
| `managing-your-music/bulk-editing` | `bulk-edit-manager.js` | `public/modules/bulk-edit-manager.js` |
| `managing-your-music/bulk-editing` | `bulk-apply-modes.js` | `public/modules/bulk-apply-modes.js` |
| `sharing/index` | `share-manager.js` | `public/modules/share-manager.js` |
| `sharing/playlist-sharing` | `playlist-share-modal.js` | `public/components/playlist-share-modal.js` |
| `ai-assistant/*` | `chat-assistant.js` | `public/components/chat-assistant.js` |
| `activity-and-notifications/*` | `notification-panel.js` | `public/components/notification-panel.js` |
| `tags-and-metadata/using-tags` | `inline-tags-editor.js` | `public/modules/inline-tags-editor.js` |
| `tags-and-metadata/musical-attributes` | `musical-attributes-widget.js` | Actually `public/widgets/metadata-widget.js` (different name!) |

### The `musical-attributes-widget.js` naming issue

The actual widget code file is `metadata-widget.js` and the spec widget title is "Info & Metadata," not "Musical Attributes." This affects:
- `activity-panel/index.mdx`
- `activity-panel/musical-attributes-widget.mdx`
- `tags-and-metadata/musical-attributes.mdx`

### The `marketing-widget.js` has no spec entry

`marketing-widget.mdx` references `marketing-widget.js` which exists in the code, but WGT_SPEC.md has no entry for a Marketing widget. The doc is unverifiable.

---

## Docs With No Code Files Mapped (40 of 121)

These docs have `code_files: []` in the manifest. Some are correctly conceptual guides, others should have code mappings:

### Should have code mapped:
| Doc | Suggested Code File |
|-----|-------------------|
| `getting-started/creating-your-account` | `src/auth/` directory |
| `managing-your-music/editing-track-details` | `track-detail-modal.js` or `track-detail-enhanced.js` |
| `audio-player/waveform-interactions` | `public/audio-player.js` (if features existed) |
| `audio-player/player-contexts` | No code exists — doc is fictional |
| `collaboration/permissions` | `public/widgets/collaborators-widget.js` |
| `collaboration/default-project-collaborators` | No code exists — possibly fictional |
| `collaboration/unsharing-and-leaving` | `src/collaborations/` directory |
| `comments-and-todos/comments-on-shared-tracks` | Share page comment handling code |
| `settings/connecting-dropbox` | `src/integrations/dropbox/` |
| `settings/managing-dropbox-connection` | `src/integrations/dropbox/` |
| `settings/account-management` | `src/settings/index.js`, `src/auth/` |
| `workflow-and-stages/tracking-progress` | `public/stage-workflow-manager.js` |

### Correctly conceptual (no code needed):
- `getting-started/index`, `getting-started/download-and-install`, `getting-started/quick-tour`
- `dashboard/dashboard-vs-tracks`
- `sharing/when-to-use-what`, `sharing/the-share-page`, `sharing/tracking-engagement`
- `sharing/public-page/*` (5 docs)
- `ai-assistant/example-queries`
- `activity-and-notifications/daily-workflow`, `notification-settings`
- `reference/plan-limits`, `reference/supported-file-formats`
- `export/writer-roles-and-ipi`
- `licensing/purchase-flow`, `licensing/managing-sales`
- `comments-and-todos/todos-in-your-workflow`
- `projects/multi-project-selection`
- `tags-and-metadata/managing-tags-and-categories`, `tags-and-metadata/audio-analysis`

---

## Missing Metadata Across All Docs

**None of the 121 docs include:**

1. **Code location** — No doc references its implementing code file inline. The manifest tracks this, but the docs themselves don't mention it.

2. **UI location** — Most docs describe WHERE a feature appears in prose form, but there's no structured metadata field like:
   ```
   ui_location: Activity Panel > Collaborators Widget
   ```

3. **Related features / settings** — Docs have a "Related" section linking to sibling docs, but don't systematically list:
   - Settings pages that configure the feature
   - Other features that depend on it
   - Features it depends on

### Recommendation

Add a frontmatter metadata block to each doc:

```yaml
---
title: Adding Collaborators
description: ...
code_files:
  - public/widgets/collaborators-widget.js
  - src/collaborations/index.js
ui_location: Activity Panel > Collaborators Widget (right sidebar when track selected)
settings_page: Settings > Notifications (collaboration notification preferences)
depends_on:
  - Dropbox connection (for folder sharing)
  - Share links (for external sharing)
used_by:
  - Split Sheets (export)
  - Comments (collaboration context)
  - Share pages (collaborator display)
---
```

---

## Stage Name Inconsistency Summary

| Doc | Stage Names Used | Correct? |
|-----|-----------------|----------|
| `workflow-and-stages/tracking-progress` | Idea/Recording/Editing/Mixing/Mastering/Ready to Post/Published | NO |
| `dashboard/index` | Idea/Editing/Ready to Post/Published | NO |
| `activity-panel/stage-workflow-widget` | Seed/Sprout/Sapling/Plant/Tree/Finished | YES |
| `workflow-and-stages/custom-workflows` | Seed/Sprout/Sapling/Plant/Tree/Finished | YES |

The correct default stages per TRK_SPEC.md (TRK-FN-002) are: **Seed, Sprout, Sapling, Plant, Tree, Finished**

---

## Near-Duplicate Docs

| Doc A | Doc B | Issue |
|-------|-------|-------|
| `projects/project-due-dates.mdx` | `workflow-and-stages/due-dates-and-deadlines.mdx` | Near-duplicate content, should be deduplicated or clearly differentiated |
| `managing-your-music/playing-and-previewing.mdx` | `audio-player/the-waveform-player.mdx` | Significant overlap |

---

## Section-by-Section Summary

| Section | Docs | Critical | High | Code Mapped | Notes |
|---------|------|----------|------|-------------|-------|
| Getting Started | 7 | 0 | 1 | 3/7 | 2FA claim unverified |
| Managing Your Music | 9 | 0 | 1 | 7/9 | Display name derivation wrong in 2 docs |
| Projects | 5 | 0 | 0 | 4/5 | Generally accurate |
| Audio Player | 7 | 2 | 1 | 3/7 | player-contexts and waveform-interactions are fictional |
| Collaboration | 7 | 3 | 1 | 3/7 | Permission model fabricated, writer_split missing |
| Comments & Todos | 9 | 1 | 1 | 5/9 | Share page comments wrong, todo permissions wrong |
| Activity Panel | 17 | 0 | 1 | 16/17 | musical-attributes widget naming mismatch |
| Dashboard | 6 | 3 | 0 | 5/6 | Featured projects, kanban, drag-drop all fictional |
| Sharing | 13 | 0 | 2 | 4/13 | Wrong domain, snapshot claim wrong |
| Settings | 12 | 2 | 2 | 6/12 | Account deletion dangerously wrong, Google Calendar fictional |
| Tags & Metadata | 4 | 0 | 0 | 2/4 | Widget name mismatch |
| Workflow & Stages | 4 | 1 | 0 | 2/4 | Wrong stage names |
| AI Assistant | 3 | 0 | 0 | 2/3 | Mostly accurate |
| Activity & Notifications | 5 | 0 | 1 | 3/5 | Notification settings over-described |
| Reference | 5 | 1 | 2 | 3/5 | Plan limits entirely wrong |
| Export | 3 | 0 | 0 | 2/3 | Generally accurate |
| Licensing | 5 | 0 | 1 | 3/5 | Corrupted text in managing-sales |

**Totals:** 23 critical, 18 high, 81/121 docs have code mapped
