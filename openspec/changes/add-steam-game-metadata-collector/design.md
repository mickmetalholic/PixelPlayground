## Context

The current Steam metadata workspace is implemented as a read-only Next.js admin surface at `/data-management/steam-game-metadata`. Browser code calls frontend `/api/trpc`, and the shared `@pixel-playground/api` Steam router currently resolves list and detail requests from fixed mock data in-process. The Nest backend exposes a general `/trpc` bridge but does not yet own Steam metadata storage or Steam API access.

This change follows the durable Superpowers design in `docs/superpowers/specs/2026-05-03-steam-game-metadata-collector-design.md`. It turns the existing mock catalog into a backend-backed metadata repository with explicit user-triggered collection from Steam appdetails.

## Goals / Non-Goals

**Goals:**

- Add a modal-driven collection flow to the existing Steam metadata workspace.
- Keep frontend browser code calling only `steam.*` tRPC procedures through the frontend BFF.
- Move Steam list/detail data ownership to the Nest backend.
- Add backend collection from `https://store.steampowered.com/api/appdetails?appids=<appid>`.
- Normalize Steam appdetails into the existing summary/detail contract with richer optional fields where needed.
- Store records in an in-memory repository seeded with the existing seven mock records.
- Upsert collected games by Steam AppID, overwriting existing records and updating `lastSyncedAt`.
- Keep repository boundaries ready for a future MongoDB implementation.

**Non-Goals:**

- Do not connect to real MongoDB in this change.
- Do not add batch collection, scheduled sync, queues, retry dashboards, import/export, or edit forms.
- Do not expose AppID input directly on the first-level workspace page.
- Do not add authentication, authorization, or audit logging.

## Decisions

1. Backend owns collection and repository behavior.

   The Nest backend will add a Steam metadata module with controller, service, repository, Steam client, and normalizer. This keeps external Steam access and write semantics out of the frontend process.

   Alternative considered: keep collection inside `packages/api` so both frontend and backend can execute it. This is faster to wire, but it leaves the frontend BFF owning runtime Steam calls and mutable state, which conflicts with the backend ownership direction and future MongoDB replacement.

2. Frontend BFF remains the browser-facing contract.

   The browser will continue to use `trpc.steam.games`, `trpc.steam.detail`, and the new `trpc.steam.collect`. The frontend BFF will call backend endpoints internally. This preserves the existing frontend tRPC pattern while allowing backend ownership.

   Alternative considered: have the browser call backend REST directly. That would bypass the established BFF layer and duplicate client-side data access patterns.

3. Backend API can be REST for the first backend boundary.

   The backend module may expose `GET /steam/games`, `GET /steam/games/:steamId`, and `POST /steam/games/collect`, with the frontend BFF mapping those calls into tRPC procedures. This creates a simple backend capability boundary without forcing the backend `/trpc` adapter to solve state injection for the shared router.

   Alternative considered: backend tRPC procedures only. That keeps a single RPC style, but the existing shared router currently has no dependency injection boundary for backend services and would require larger cross-package changes.

4. In-memory repository is the first persistence layer.

   The repository stores normalized `SteamGameDetail` records by `steamId`. It seeds itself from the existing seven mock games so the workspace remains useful immediately after startup. A future MongoDB repository can implement the same interface.

   Alternative considered: connect MongoDB immediately. That adds environment setup, connection handling, and migration concerns before the collection workflow is proven.

5. Collection is modal-driven.

   The first-level workspace page adds one collection button. The AppID input lives in a modal, keeping the main operational surface focused on search, list review, and detail inspection.

   Alternative considered: put an AppID input in the header. That is faster but makes the top-level page feel more like a form than a metadata review workspace.

## Risks / Trade-offs

- Backend service dependency risk -> The frontend BFF list/detail queries will now require a running backend instead of always resolving locally. Mitigate with clear error states and tests for backend client failures.
- Steam API instability or rate limiting -> Only call Steam during explicit collection requests, map transport failures to stable BFF errors, and keep existing records unchanged when collection fails.
- HTML-heavy appdetails fields -> Normalize safe display fields while retaining the raw payload for later mapping improvements.
- In-memory persistence is ephemeral -> Make this explicit in UI/status copy and keep the repository interface small so MongoDB can replace it later.
- Shared type drift across packages -> Keep the public Steam metadata types in `packages/api`, add tests around BFF/backend mapping, and avoid frontend-only duplicate models.

## Migration Plan

1. Add backend Steam metadata module and seed it with the existing mock records.
2. Add backend endpoints for list, detail, and collection.
3. Add or adapt frontend BFF backend client methods for Steam metadata.
4. Update shared tRPC router with `steam.collect` and backend delegation.
5. Update the frontend workspace header with a collection button and modal.
6. Add targeted tests for backend collection, BFF mapping, and modal behavior.
7. Validate with `openspec validate add-steam-game-metadata-collector`.

Rollback is straightforward while storage is in memory: revert the BFF to local mock resolution and remove the collection UI. No database migration is involved.

## Open Questions

- Whether the future MongoDB implementation should store the raw Steam payload in the same collection as normalized fields or in a separate raw-ingestion collection.
- Whether a later change should fetch Steam data with `l=schinese` to improve distinct Chinese names.
