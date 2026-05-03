## Context

The current frontend root page renders a small tRPC demo. The product direction for this change needs a first operational workspace entry point for Steam-oriented data management and content production, but the underlying Steam workflows are not part of this change.

The approved source design is `docs/superpowers/specs/2026-05-03-frontend-workspace-home-design.md`. The implementation should stay inside `apps/frontend`, preserve existing package boundaries, and avoid backend or shared API changes.

## Goals / Non-Goals

**Goals:**

- Provide a semantic, bookmarkable workspace route structure under `/workspace/[section]/[item]`.
- Route `/` to the default workspace route.
- Render a shared workspace shell with top navigation, contextual left sidebar, and blank main work area.
- Represent navigation through a small config object so future menu additions do not require scattered label or href edits.
- Use the existing Next App Router, React, Tailwind, and local UI conventions.

**Non-Goals:**

- Do not implement Steam metadata CRUD, forms, tables, imports, exports, or validation.
- Do not implement Steam daily discount generation, scheduling, publishing, or templates.
- Do not add authentication, permissions, settings, backend APIs, or new dependencies.
- Do not refactor unrelated playground routes or existing shared packages.

## Decisions

### Use semantic workspace routes

Use `/workspace/data-management/steam-game-metadata` and `/workspace/content-production/steam-daily-discounts` instead of query strings or hash routing.

Rationale: semantic routes fit Next App Router, support refresh/bookmark/link behavior, and keep the single workspace shell feeling like a single-page product surface.

Alternatives considered:

- Query-string routing such as `/?section=data-management&item=steam-game-metadata`: faster to wire but less readable and less aligned with App Router conventions.
- Hash routing: familiar SPA behavior but less idiomatic for this codebase and weaker for server-rendered route validation.

### Keep navigation declarative

Use a workspace navigation config to define section slugs, labels, default items, sidebar items, and hrefs.

Rationale: this keeps Chinese display labels and route slugs in one place, makes active-state resolution predictable, and reduces future menu expansion work.

Alternatives considered:

- Hard-code links directly in page JSX: acceptable for two links, but it would quickly duplicate route and label knowledge.
- Store navigation in global client state: unnecessary because the URL is the source of truth.

### Use route params as source of truth

The route page resolves `section` and `item` params against the navigation config. The shell receives resolved active entries and renders links.

Rationale: this avoids client-only state, keeps refresh behavior correct, and makes invalid route handling explicit.

### Use `notFound` for invalid workspace params

Unknown `section` or `item` values should render Next's not-found behavior instead of redirecting to a default.

Rationale: invalid workspace URLs are broken links or stale links. Showing not-found avoids hiding mistakes as valid navigation states.

### Keep the main work area blank

The main workspace area should render a neutral blank area with no feature description copy.

Rationale: this change establishes structure only. Avoiding feature copy keeps future Steam metadata and content production implementations free to define their own surfaces.

## Risks / Trade-offs

- Route shape could need expansion later -> Keep the navigation config narrow and additive so future sidebar items can be added without changing the shell contract.
- Blank content may look unfinished -> Use restrained layout affordances and spacing while avoiding explanatory feature text.
- Mobile behavior could grow into a larger navigation problem -> Provide a simple responsive fallback now and defer richer collapse/drawer behavior until there are more menu items.
- Replacing the current root demo removes a quick tRPC smoke page from `/` -> Existing playground routes remain available, and this change intentionally moves the product entry point to the workspace.

## Migration Plan

1. Add the workspace navigation config and shell components under `apps/frontend`.
2. Add the dynamic workspace route and root redirect.
3. Verify the default route, both supported workspace routes, and invalid workspace route behavior.
4. Run the narrow frontend build/type verification.

Rollback is straightforward: remove the workspace route files/config and restore the previous root page behavior from version control if needed.

## Open Questions

None for this scope.
