## Context

PixelPlayground already has a data-management workspace for Steam game metadata at `/data-management/steam-game-metadata`. The shared API package owns the `steam` tRPC router, Steam game contracts, mock game records, search, pagination, and tests. The frontend workspace shell renders data-management tools from `workspaceNav`, with tool-specific components selected inside the shared shell.

This change introduces a separate read-only data-management page for game discount events. Discount events are a new entity that references existing Steam game metadata by `steamId`. The first version must stay mock-first and in-memory, matching the current development posture, while keeping contracts suitable for later persistence and CRUD.

Relevant existing design context includes the tRPC full-stack design in `docs/superpowers/specs/2026-04-16-trpc-full-stack-design.md` and the current `steam-game-metadata` OpenSpec capability.

## Goals / Non-Goals

**Goals:**

- Model game discount events with a stable typed contract.
- Store mock discount event records in memory and include several seeded records.
- Expose a `steam.discountEvents` query that returns joined game summary data.
- Sort discount events by `startAt` descending.
- Add a Data Management sidebar item and read-only list page.
- Render loading, empty, and error states consistent with the existing workspace UI.
- Add focused API tests for sorting, association, and pagination.

**Non-Goals:**

- Creating, editing, or deleting discount events.
- Real database persistence.
- Live Steam discount or historical-low ingestion.
- Filtering, searching, calendar views, or content-production workflows.
- Changing existing Steam game metadata requirements.

## Decisions

### Use a New Discount Event Contract in the Shared API Package

The discount event contract will live near existing Steam game types in `packages/api`. The event type will include `id`, `steamId`, `startAt`, `endAt`, `discountPercent`, `discountedPrice`, and `type`. The list item returned by the query will include a joined `game` summary with `steamId`, names, and images.

Alternative considered: store display-ready rows only in the frontend. That would be faster for a mock page but would make the future database/API migration awkward and would duplicate game summary fields in the UI.

### Represent Price as Currency Plus Integer Minor Units

Discounted price will follow the existing Steam price convention: `currency`, integer `final` minor units, and optional/display `finalFormatted`. This avoids floating-point currency issues and aligns with `SteamPriceOverview`.

Alternative considered: storing `"$14.99"` as a string. That is simpler but weakens sorting, comparison, and future price calculations.

### Expose a Read-Only `steam.discountEvents` Query

The first API surface will be a query with `limit` and optional `cursor`, returning `{ items, pageInfo, total }`. No search or filters are included in this change. The query sorts by `startAt` descending before pagination.

Alternative considered: adding a new top-level `discounts` router. Keeping the query under `steam` matches the current Steam metadata boundary and avoids a new router for one closely related Steam data entity.

### Join Mock Events to Existing Mock Game Metadata in the API Layer

Mock event records will store only the `steamId` foreign key. The tRPC query will join events to existing mock game records and return a game summary. Events whose `steamId` cannot be resolved will be excluded in the first version so the UI never renders orphan rows.

Alternative considered: returning bare events and requiring the frontend to call `steam.detail` per row. That would be wasteful and would introduce unnecessary loading and failure states.

### Add a Separate Data Management Page

The frontend will add `/data-management/game-discount-events` as a sidebar sibling of Steam game metadata. The page will use the existing workspace shell and render a compact, read-only table with game, Steam ID, period, discount percent, sale price, and type badge columns.

Alternative considered: embedding discount events into the existing Steam metadata page. That keeps game context nearby but makes the metadata workspace heavier and conflicts with the requested standalone management surface.

## Risks / Trade-offs

- [Risk] Mock event data can drift away from mock game metadata. -> Mitigation: keep events keyed by `steamId` and write tests that assert joined game summaries are present.
- [Risk] Excluding orphan events can hide bad mock data. -> Mitigation: keep this behavior explicit in tests and revisit when persistence introduces validation.
- [Risk] A read-only page may need CRUD soon. -> Mitigation: define the contract around an event entity now so mutation endpoints can be added without reshaping list rows.
- [Risk] Table width can overflow on mobile. -> Mitigation: use existing dense workspace patterns and internal scroll containers rather than page-level horizontal scrolling.

## Migration Plan

No data migration is required. This change adds mock data, a query, and a new frontend page. Rollback is to remove the sidebar item/page and the `steam.discountEvents` query additions.

## Open Questions

None for the first read-only mock implementation.
