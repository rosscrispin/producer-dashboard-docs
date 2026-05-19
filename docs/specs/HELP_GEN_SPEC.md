# Help Docs Generation Specification

<!-- Reviewed: 2026-05-18 -->
<!-- Updated: 2026-05-18 - Defines network/file safety controls for generated help docs and static manifests. -->

> Domain Code: HELP
> Scope: OpenRouter-assisted help documentation generation, generated MDX writes, and static docs manifest writes.

## Intent

The help documentation generators may send selected documentation, spec, and code excerpts to OpenRouter to draft user-facing docs metadata and help pages. Those scripts must keep the outbound payload intentional and bounded, and must sanitize any model response before committing it to files served by the docs site.

## Out Of Scope

- Product runtime behavior in Producer Dashboard.
- Manual edits to authored documentation pages outside generator output paths.
- Runtime authorization for OpenRouter; API keys remain environment-provided only.

## Requirements

- **HELP-GEN-006** - OpenRouter request builders MUST send only the selected prompt content assembled by the generator, MUST use the configured OpenRouter endpoint, MUST enforce a request timeout, and MUST NOT read API keys from committed files. P0
- **HELP-GEN-007** - Generated MDX writes MUST be constrained to the configured docs directory, sanitized before writing, and rejected when content includes executable script tags, inline event handlers, JavaScript/data links, or MDX import/export statements. P0
- **HELP-GEN-011** - Static docs manifest writes MUST be constrained to the allowlisted public JSON filenames, and model responses MUST be sanitized against known docs slugs before writing. P0

## Acceptance

- [ ] `scripts/generate-help-docs.mjs --dry-run` does not call OpenRouter or write generated docs.
- [ ] `scripts/generate-docs-manifest.js --dry-run` does not call OpenRouter or write static manifest JSON.
- [ ] Attempts to write generated docs outside the docs directory fail before file write.
- [ ] Generated MDX containing scripts, inline handlers, JavaScript/data links, or import/export statements is rejected.
- [ ] Manifest output accepts only `docs-index.json` and `docs-graph.json`, with slug references limited to discovered docs.
