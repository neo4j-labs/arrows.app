<!--
Sync Impact Report
==================
Version change: (template) → 1.0.0
Modified principles: N/A (initial adoption from template)
Added sections: All placeholder sections filled
Removed sections: None
Templates:
  .specify/templates/plan-template.md       ✅ (Constitution Check references constitution file; no update needed)
  .specify/templates/spec-template.md      ✅ (scope/requirements align; no update needed)
  .specify/templates/tasks-template.md    ✅ (task types compatible; no update needed)
  .specify/templates/checklist-template.md ✅ (no constitution references; no update needed)
  .specify/templates/commands/*.md         N/A (no commands directory)
Follow-up TODOs: None
-->

# Arrows.app Constitution

## Core Principles

### I. Drawing-Only Purpose

Arrows.app exists solely to draw pictures of graphs for use in documents or presentations. The tool MUST NOT provide database exploration, query execution, or semantic graph visualization (those belong to Neo4j Browser and Neo4j Bloom). New features MUST not blur this boundary.

**Rationale**: Clear scope prevents scope creep and keeps the app simple and maintainable.

### II. Neo4j Property Graph Model

The editor and exports MUST support the Neo4j property graph model: nodes, relationships, properties, and labels. Export to Cypher for creating graphs in a Neo4j database is a core requirement and MUST be preserved. Data model changes MUST remain compatible with Neo4j Cypher and the property graph model.

**Rationale**: The project is the logical successor to arrows and serves the Neo4j ecosystem; compatibility is non-negotiable.

### III. Dependency-Free Rendering Core

The core rendering code (Canvas and SVG output) MUST remain free of application frameworks (e.g. React, Redux). This code MUST be self-contained so it can be reused or adopted across Neo4j products. The React-Redux app layer MAY depend on the rendering core; the core MUST NOT depend on the app layer.

**Rationale**: README states the hope that advanced rendering may be widely adopted across Neo4j products; a clean core enables that.

### IV. User-Controlled Layout and Styling

There is no automated layout: users MUST position nodes manually. Styling MUST be fine-grained and under explicit user control (sizes, positions, colors). Styling MUST NOT be semantic (e.g. "all nodes with label X have color Y"); the user selects elements and applies style. Introducing semantic or automatic layout requires a constitution amendment.

**Rationale**: Aligns with documented anti-features and keeps the tool predictable and document-oriented.

### V. Export and Portability

Export as image (primary use: documents, presentations) and as Cypher (Neo4j) MUST be supported. Correctness and portability of exports take precedence over extra features. Export formats MUST be well-defined and stable; breaking changes to export behavior require justification and documentation.

**Rationale**: The main value is producing artifacts for use elsewhere; reliability of those artifacts is paramount.

## Technology & Constraints

- **Stack**: React 18, Redux, TypeScript; build via Nx and Vite. Rendering core is dependency-free JS (Canvas/SVG).
- **License**: Apache License 2.0. All contributions MUST be compatible.
- **No direct database connection**: The app does not run queries or explore a live database; optional storage of pictures to Neo4j may exist but is out of scope for core development unless explicitly scoped.
- **Platform**: Web-based; runs in modern browsers. No server-side rendering requirement for the core app.

## Development Workflow

- **Open source**: Managed under Neo4j Labs; contributions welcome via GitHub (issues, discussions, Discord #neo4j-arrows).
- **Spec-driven work**: Use `.specify` (specs, plans, tasks) for feature work; Constitution Check in plans MUST pass before Phase 0 research and after Phase 1 design.
- **Testing**: Test coverage and quality gates SHOULD align with the feature spec and plan; new contracts or export behavior MUST be tested.
- **Documentation**: README and project docs MUST reflect current scope and anti-features; principle-breaking changes require constitution amendment first.

## Governance

- This constitution supersedes ad-hoc practices for scope, model, and architecture decisions. When in doubt, principles and constraints here take precedence.
- **Amendments**: Require a concrete proposal, impact on principles/sections, and version bump per semantic versioning. Document the change in the constitution and prepend a Sync Impact Report (version, modified/added/removed sections, template and doc updates). Update dependent templates and runtime guidance (e.g. README) when principles or constraints change.
- **Compliance**: All PRs and design reviews MUST verify that changes align with this constitution. Violations (e.g. new semantic styling, automated layout, or coupling in the rendering core) MUST be justified in the plan’s Complexity Tracking table or resolved before merge.
- **Runtime guidance**: Use the project README and `.specify` documentation for day-to-day development; this constitution is the source of truth for governance and scope.

**Version**: 1.0.0 | **Ratified**: 2025-02-23 | **Last Amended**: 2025-02-23
