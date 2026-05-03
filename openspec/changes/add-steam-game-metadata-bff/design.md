## Context

`/data-management/steam-game-metadata` already exists as the default workspace entry, but the current `WorkspaceShell` renders hard-coded placeholder panels for workspace tools. The new experience must turn the Steam metadata entry into a read-only operational UI while preserving the existing Next.js App Router, Tailwind, shadcn-style primitives, and workspace navigation.

This design follows the earlier frontend BFF direction documented in `docs/superpowers/specs/2026-04-13-frontend-next-bff-design.md`: browser-facing code should use explicit Next route handlers for use-case contracts, not a catch-all proxy. It also follows the durable design in `docs/superpowers/specs/2026-05-03-steam-game-metadata-design.md`.

The first implementation uses fixed mock data extracted from Steam appdetails for seven Steam app IDs. Runtime requests must not call Steam, Nest, or a database. The BFF contract is still shaped for future larger data sources because future search volume is expected to be large.

## Goals / Non-Goals

**Goals:**

- Provide a read-only Steam game metadata workspace at `/data-management/steam-game-metadata`.
- Add explicit Next BFF route handlers for list search and detail lookup.
- Keep search on the BFF side, matching SteamID, English name, and Chinese name.
- Store fixed mock Steam metadata behind the BFF/server boundary.
- Present a professional, data-dense admin UI consistent with the existing workspace shell and theme tokens.
- Cover search, pagination shape, detail lookup, missing detail, and fallback-name behavior with focused tests.

**Non-Goals:**

- No editing, persistence, imports, exports, batch operations, audit trail, authentication, or authorization.
- No runtime Steam API calls, Steam sync jobs, Nest backend integration, or database access.
- No general-purpose BFF proxy.
- No redesign of the whole workspace shell or global theme.

## Decisions

### Decision 1: Use explicit Next BFF route handlers

Add `GET /api/steam/games` and `GET /api/steam/games/[steamId]` under `apps/frontend/src/app/api/steam/games`.

Rationale:

- Keeps browser code decoupled from the mock data module and from future backing stores.
- Preserves a stable route contract that can later switch from in-memory mock data to cache, database, or backend service.
- Matches the existing frontend BFF design preference for explicit use-case routes.

Alternatives considered:

- Import mock data directly into the page. This is simpler, but it weakens the future BFF boundary and puts full-result filtering in the browser.
- Add a generic proxy route. This conflicts with the existing BFF guidance and would not model the intended Steam metadata contract.

### Decision 2: Keep the first data source as local mock data

Create a typed mock data module with records derived from Steam appdetails for app IDs `1091500`, `570`, `578080`, `2868840`, `2507950`, `271590`, and `413150`.

Rationale:

- Gives the UI realistic images, names, prices, release dates, descriptions, and categories without introducing runtime network variability.
- Makes tests deterministic.
- Leaves the route handler as the only data access point for the page.

Alternatives considered:

- Runtime Steam appdetails calls. This would slow local development, introduce failure modes outside the app, and make tests more fragile.
- Store only tiny placeholder records. This would not exercise the detail panel or data-dense UI well enough.

### Decision 3: Split list summaries from detail records

The list endpoint returns `SteamGameSummary[]` inside `{ items, pageInfo, query, total }`. The detail endpoint returns `SteamGameDetail`.

Rationale:

- Avoids teaching the UI to depend on full-detail payloads for every search result.
- Keeps the BFF shape useful when the data source becomes large.
- Lets the right-side panel load or refresh detail independently.

Alternatives considered:

- Return all detail fields from the list endpoint. This is simpler with seven mock records, but it bakes in an inefficient contract.
- Use only the list response for the detail panel. This reduces one request but weakens the detail contract.

### Decision 4: Search and pagination happen in BFF helpers

Search helpers normalize query text and match against `steamId`, `nameEn`, and `nameZh`. `limit` controls page size. `cursor` is encoded from the filtered result offset for the first version.

Rationale:

- Keeps behavior testable without rendering React.
- Models future server-side search.
- Keeps route handlers thin and easier to validate.

Alternatives considered:

- Client-side filtering. This is fine for seven records but contradicts the future large-data requirement.
- Full text search dependency. This is unnecessary for the first mock-only implementation.

### Decision 5: Refactor workspace rendering around tool content

`WorkspaceShell` should keep common header, section navigation, and sidebar behavior, but the `steam-game-metadata` item should render a dedicated Steam metadata workspace component. Unimplemented tools can keep the existing placeholder panel behavior.

Rationale:

- Stops the shell from hard-coding all tool bodies.
- Keeps the existing navigation and visual identity intact.
- Creates a natural place for future tools to provide their own content.

Alternatives considered:

- Replace `WorkspaceShell` entirely. This is too broad and risks unrelated UI churn.
- Put all Steam UI directly inside `WorkspaceShell`. This would make the shell harder to maintain.

### Decision 6: Use a data-dense admin UI

Use a compact table/list area with image thumbnails and metadata columns, plus a right-side detail panel. Use existing theme tokens and lucide icons. Use hover, focus, selected, loading, empty, error, and not-found states.

Rationale:

- The task is operational data review, not marketing or editorial content.
- A table-like list and detail panel support scanning and repeated selection.
- Existing visual language remains stable across the workspace.

Alternatives considered:

- Card grid. It makes game art prominent but reduces scanability for metadata management.
- Modal detail view. It is lightweight but poor for repeated browsing and comparison.
- Separate detail page. It gives shareable URLs but adds navigation friction for this first management surface.

## Data Flow

```text
Browser workspace page
  -> fetch /api/steam/games?q=&limit=&cursor=
  -> Next route handler
  -> typed mock data + search helper
  -> list response

Browser selects a row
  -> fetch /api/steam/games/[steamId]
  -> Next route handler
  -> typed mock data lookup
  -> detail response or stable 404 JSON
```

The browser never imports the mock data module for list filtering. The page may keep the previous list visible while a new search is loading, but the authoritative filtered results come from the BFF response.

## Failure Modes

- Invalid `limit` or `cursor` -> return 400 stable JSON from the list route.
- Detail `steamId` not found -> return 404 stable JSON with `STEAM_GAME_NOT_FOUND`.
- Unexpected BFF failure -> return 500 stable JSON without stack traces or local paths.
- Image loading failure -> render a stable visual placeholder so row and panel layout do not shift.
- Empty search result -> show an empty list state and a neutral detail empty state.
- Selected game disappears after search -> select the first returned item, or clear detail when no items remain.

## Test Strategy

- Add pure search helper tests for SteamID, English name, Chinese name, empty query, limit, cursor/pageInfo, and name fallback behavior.
- Add route handler tests for list success, invalid parameters, detail success, and detail 404.
- Add focused frontend tests where practical for query construction, empty state, and selection fallback.
- Run `pnpm --filter @pixel-playground/frontend test` first, followed by `pnpm lint` and `pnpm build` when implementation is complete.

## Migration Plan

1. Add BFF mock data, types, search helpers, and route handlers.
2. Refactor workspace shell rendering to delegate Steam metadata content to a dedicated component while preserving placeholder behavior for other tools.
3. Add the Steam metadata UI and client-side state for search, selected row, detail loading, and error states.
4. Add tests and run the focused frontend verification.

Rollback is straightforward: remove the new route handlers/components and restore the previous placeholder rendering for `steam-game-metadata`. No persistent data migration is involved.

## Risks / Trade-offs

- Mock data may drift from real Steam appdetails -> Keep mock data explicitly scoped as fixed fixture data and avoid claiming live freshness in the UI.
- Right-side detail on small screens can become cramped -> Use a single-column responsive layout on mobile, with list first and detail below.
- Offset cursor is not suitable for mutable large datasets -> Treat it as a first-version compatibility shape, not the future storage strategy.
- BFF route tests can be awkward if handlers are not factored cleanly -> Keep validation, search, and response construction in testable helpers.
- Refactoring `WorkspaceShell` can affect other workspace items -> Preserve the existing placeholder path for non-Steam tools and keep changes scoped.

## Open Questions

- None for the first implementation.
