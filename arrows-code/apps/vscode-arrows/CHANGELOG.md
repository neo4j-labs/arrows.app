# Changelog

All notable changes to the Arrows VS Code extension.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project does not yet follow strict semver — pre-1.0 releases may break.

## [Unreleased]

### Added
- Embedded arrows.app canvas as a Custom Editor for `.arrows` files.
- Two-way sync with bounded-emit-history echo suppression and inbound-deferral queue (drag / edit / input-focus aware).
- Select / Pan tools with V / H shortcuts, Space-held temporary pan, Figma-style cursor hints.
- Scroll-to-zoom (cursor-anchored, free range `[0.05, 5]`), bypasses the canvas-fit clamp.
- Double-click to create a node at the cursor; right-click context menu with entity-aware actions (Edit / Duplicate / Delete for nodes; Edit type / Reverse / Delete for relationships).
- Drag continuation past the canvas edge — the viewport follows the cursor.
- Sidebar tree view with workspace `.arrows` files, bundled examples, and quick actions.
- Commands: New Graph, Format, Validate, Export SVG / Cypher, Copy Cypher, Rename Label, Rename Relationship Type, Delete Graph File.
- File-icon contribution (light / dark) + activity-bar icon (theme-tinted line variant of the arrows logo).

### Fixed
- Cypher export escapes backticks in identifiers and double-quotes / backslashes in string values, preventing injection from user-controlled labels or property values.
- `applyEdit` rejection (read-only docs, untrusted workspace) now surfaces a warning instead of failing silently.
- `resolveDocument` reports open errors instead of silently falling back to a different document.
- Save dialog defaults to the workspace folder (or `homedir()` if no workspace), not to the OS root.
- Inspector glyphs load: rewrote post-Vite CSS asset URLs from absolute `/assets/…` to relative `./…` so the Semantic UI icon font resolves through `localResourceRoots`.
- Activity-bar icon renders as a recognizable silhouette under VS Code's currentColor tint.

### Sync hardening
- Rapid A → B edits no longer revert to A when the host echoes back (canonical comparison strips `entityType` divergence between reducer-output and `readGraph`-output node shapes).
- Mid-drag host echoes are queued and applied on drag-end; the user's in-flight gesture is never clobbered.
- The "second action gets reversed" bug class — caused by a stale `docVersion` after self-applied edits — is eliminated by dropping the version guard and serializing `applyEdit` calls through a Promise chain.

### Tests
- 200+ unit + integration tests covering the bridge state machine, pan / zoom decisions, sync decisions, command handlers, canonical JSON, Cypher escape, validator structural rules.
- Real VS Code Electron integration suite (`@vscode/test-electron`) covering all command handlers.
- Playwright smoke suite for embed canvas behavior.
