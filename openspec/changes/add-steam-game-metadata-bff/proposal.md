## Why

The existing Steam game metadata workspace entry is only a placeholder, but it is intended to become a practical data-management surface for game metadata review. This change adds a read-only Steam game metadata browser with BFF-backed search so the first UI and API boundary are aligned with future large-data-source needs.

## What Changes

- Replace the placeholder Steam game metadata workspace content with a professional, data-dense admin interface.
- Add a read-only game list that displays Steam cover art, SteamID, English name, Chinese name, release date, price/free state, and key publisher/developer metadata.
- Add BFF route handlers for searching Steam games and loading a selected game's full detail.
- Keep the first data source as fixed mock data extracted from Steam appdetails for app IDs `1091500`, `570`, `578080`, `2868840`, `2507950`, `271590`, and `413150`.
- Search by SteamID, English name, and Chinese name on the BFF side, preserving an API shape that can later move to a database, cache, or sync service.
- Add a right-side detail panel for the selected game with fuller metadata, store links, descriptions, categories, screenshots, and fallback-state indicators.
- Add loading, empty, error, and not-found states for the list and detail experience.
- Add focused tests for BFF filtering, pagination shape, detail lookup, and not-found behavior.

Non-goals:

- No data editing, persistence, import/export, batch actions, authentication, authorization, audit trail, or real Steam synchronization job.
- No runtime calls from the frontend or BFF to Steam in the first implementation.
- No integration with the Nest backend or database in the first implementation.

## Capabilities

### New Capabilities

- `steam-game-metadata`: Read-only Steam game metadata search, listing, and detail viewing through the Next.js frontend and BFF boundary.

### Modified Capabilities

None.

## Impact

- Affects `apps/frontend` route handlers, workspace rendering, Steam metadata UI components, and frontend tests.
- Introduces a stable BFF response contract for `GET /api/steam/games` and `GET /api/steam/games/[steamId]`.
- Adds local mock Steam metadata and search helpers under the frontend server/client boundary.
- Updates the behavior documented by `docs/superpowers/specs/2026-05-03-steam-game-metadata-design.md`.
