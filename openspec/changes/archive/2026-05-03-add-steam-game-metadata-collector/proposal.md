## Why

The Steam metadata workspace currently shows a fixed local catalog, so users cannot add a game by Steam AppID or refresh stale metadata from Steam. This change introduces a backend-owned collection path so the workspace can become a real data management tool while keeping the first persistence layer simple and replaceable.

## What Changes

- Add a collection action to the Steam metadata workspace that opens a modal where users enter a Steam AppID.
- Add a `steam.collect` frontend tRPC mutation that calls the frontend BFF.
- Change Steam list/detail BFF behavior from local mock resolution to backend-backed queries.
- Add a Nest backend Steam metadata capability that fetches Steam appdetails, normalizes the response, and upserts records by Steam AppID.
- Seed the backend in-memory repository with the existing seven mock Steam games and allow collection to overwrite those records.
- Preserve current search, pagination, list, and detail behavior against the backend repository.
- Keep the first implementation in memory rather than connecting to MongoDB.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `steam-game-metadata`: Adds backend-owned Steam AppID collection, changes the runtime data source from frontend-local mock data to a backend in-memory repository, and adds modal-driven collection behavior to the existing workspace.

## Impact

- Affects `apps/frontend` Steam metadata UI and `/api/trpc` BFF integration.
- Affects `apps/backend` by adding a Steam metadata module, service, repository, normalizer, and Steam appdetails client.
- Affects `packages/api` shared tRPC contract by adding `steam.collect` and adapting query behavior to backend delegation.
- Affects tests for shared API procedures, backend service/repository behavior, and the frontend collection modal.
- Requires network access from the backend to `https://store.steampowered.com/api/appdetails` only during explicit collection requests.
