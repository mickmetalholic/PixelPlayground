## Why

The existing Steam game metadata workspace entry is only a placeholder, but it is intended to become a practical data-management surface for game metadata review. This change adds a read-only Steam game metadata browser through the shared tRPC API so the frontend, BFF boundary, and future large-data-source boundary use the same typed contract.

## What Changes

- Replace the placeholder Steam game metadata workspace content with a professional, data-dense admin interface.
- Add a read-only game list that displays complete Steam capsule art, SteamID, combined English/Chinese names, release date, price/free state, platform icons, sync freshness, and key publisher/developer metadata.
- Add `steam.games` and `steam.detail` procedures to the shared `@pixel-playground/api` tRPC router for searching Steam games and loading a selected game's full detail.
- Expose those procedures through the existing frontend `/api/trpc` BFF route instead of adding dedicated `/api/steam/*` route handlers.
- Keep the first BFF implementation self-contained: Steam metadata requests are resolved in-process from local mock data and are not forwarded to the Nest backend or a backend `/trpc` upstream.
- Keep the first data source as fixed mock data extracted from Steam appdetails for app IDs `1091500`, `570`, `578080`, `2868840`, `2507950`, `271590`, and `413150`.
- Search by SteamID, English name, and Chinese name in the tRPC procedure layer, preserving an API shape that can later move to a database, cache, or backend service.
- Add a right-side detail panel for the selected game with fuller metadata, store links, descriptions, categories, screenshots, supported languages, price internals, and fallback-state indicators.
- Add loading, empty, error, image fallback, and not-found states for the list and detail experience.
- Add focused tests for tRPC procedure filtering, pagination shape, detail lookup, and not-found behavior.

Non-goals:

- No data editing, persistence, import/export, batch actions, authentication, authorization, audit trail, or real Steam synchronization job.
- No runtime calls from the frontend, tRPC procedure layer, or BFF boundary to Steam in the first implementation.
- No integration with or proxying to the Nest backend, backend `/trpc` upstream, or database in the first implementation.
- No REST-style `/api/steam/*` route handlers unless a future change explicitly requires REST compatibility.

## Capabilities

### New Capabilities

- `steam-game-metadata`: Read-only Steam game metadata search, listing, and detail viewing through the shared tRPC API and Next.js frontend.

### Modified Capabilities

None.

## Impact

- Affects `packages/api` tRPC routers, `apps/frontend` workspace rendering, Steam metadata UI components, and frontend/API tests.
- Introduces stable tRPC procedures for Steam game search and Steam game detail lookup, exposed through the existing frontend `/api/trpc` endpoint and served locally by that BFF.
- Adds local mock Steam metadata and search helpers under a boundary usable by the shared tRPC router.
- Updates the behavior documented by `docs/superpowers/specs/2026-05-03-steam-game-metadata-design.md`.
