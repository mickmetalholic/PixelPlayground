# Steam Game Metadata Collector Design

Status: Archived; implemented through OpenSpec change `add-steam-game-metadata-collector`
Date: 2026-05-03
Scope: Add a backend-owned Steam appdetails collection flow to the existing Steam game metadata management workspace. The frontend continues to call the frontend BFF through tRPC, while the Nest backend owns Steam API access, normalization, upsert behavior, and the in-memory repository that can later be replaced by MongoDB.

Archive note: This design was superseded by the archived OpenSpec change at `openspec/changes/archive/2026-05-03-add-steam-game-metadata-collector` and the current capability spec at `openspec/specs/steam-game-metadata/spec.md`.

## Background

The current Steam metadata workspace at `/data-management/steam-game-metadata` already renders a searchable list and detail panel backed by shared tRPC procedures and fixed local mock data. This is useful for the first read-only review experience, but it cannot add a new Steam game, refresh stale metadata, or exercise the backend data boundary that will be needed for a real repository.

This change upgrades the workspace from a fixed mock catalog to a backend-owned metadata collection tool. A user can click a collection action, enter a Steam AppID in a modal, and ask the backend to fetch `https://store.steampowered.com/api/appdetails?appids=<appid>`. The backend cleans and structures the response, saves it by AppID using overwrite semantics, and serves future list/detail queries from an in-memory repository.

## Decisions

| Topic | Decision |
| --- | --- |
| Collection owner | Nest backend owns Steam API access, normalization, upsert, and query storage. |
| Frontend API | The frontend only calls frontend BFF tRPC procedures under `steam.*`. |
| BFF role | The frontend BFF proxies or orchestrates calls to the Nest backend; it does not call Steam directly. |
| Backend storage | First implementation uses an in-memory repository seeded with the existing seven mock games. |
| Future storage | Repository boundaries should allow a MongoDB-backed implementation without changing UI or service contracts. |
| Duplicate AppID | Collection uses AppID as the unique key and overwrites the existing record, including `lastSyncedAt`. |
| Page-level UI | The workspace header exposes a single collection button. AppID input lives inside a modal. |
| Search | Search continues to query already-stored games by SteamID, English name, or Chinese name. |
| Runtime Steam call | Runtime Steam calls occur only when the user explicitly submits the collection modal. |

## User Experience

The Steam metadata workspace keeps the current dense admin layout: search, list, and detail panel remain the main working surface. The top status/action area adds one primary collection button. There is no AppID input on the page itself.

Clicking the collection button opens a modal. The modal contains a Steam AppID input, a submit action, and a cancel action. The submit action validates that the input is a non-empty numeric string before calling `steam.collect`. While collection is running, the submit action shows loading state and prevents duplicate submissions.

On success, the modal closes, the list query is invalidated, and the newly collected or overwritten game becomes selected in the detail panel. On failure, the modal remains open and shows the error message without disturbing the currently selected game or existing list.

The existing search box remains a query-only control. It filters the backend repository and does not trigger collection.

## Architecture

```text
Steam metadata workspace
  -> frontend tRPC client
    -> frontend /api/trpc BFF
      -> Nest backend Steam metadata API
        -> Steam appdetails API
        -> normalizer
        -> in-memory repository
```

The backend adds a `SteamMetadataModule` with separate units:

- Controller: exposes backend endpoints for list, detail, and collection.
- Service: coordinates validation, fetch, normalization, upsert, and query operations.
- Steam client: performs the appdetails HTTP request and maps transport failures.
- Normalizer: transforms Steam appdetails `data` into the shared Steam metadata shape.
- Repository: stores normalized records in memory, seeded with the existing seven mock records.

The frontend BFF keeps tRPC as the browser-facing contract:

```ts
steam.games({ q?: string, limit?: number, cursor?: string })
steam.detail({ steamId: string })
steam.collect({ steamId: string })
```

The BFF may call backend REST endpoints such as `GET /steam/games`, `GET /steam/games/:steamId`, and `POST /steam/games/collect`. This keeps the backend as the capability owner while preserving the frontend's tRPC integration.

## Data Model

The existing `SteamGameSummary` and `SteamGameDetail` models remain the main UI contract. The detail model should expand to preserve richer appdetails data where useful:

- Identity: `steamId`, `type`, `nameEn`, `nameZh`, `storeUrl`
- Descriptions: `shortDescription`, `detailedDescription`, `aboutTheGame`, `reviews`
- Media: `capsuleImage`, `headerImage`, `screenshots`, `movies`
- People and taxonomy: `developers`, `publishers`, `genres`, `categories`
- Commerce: `isFree`, `priceOverview`, `packages`, `packageGroups`
- Platforms and requirements: `platforms`, `pcRequirements`, `macRequirements`, `linuxRequirements`
- Languages: parsed `supportedLanguages` plus `supportedLanguagesRaw` when parsing is incomplete
- Timing and signals: `releaseDate`, `recommendations`, `lastSyncedAt`
- Metadata state: `metadataStatus`, `sourceLanguageFallback`
- Diagnostics and future use: raw Steam `data` payload

The list response should still return only summary fields needed for the table. Detail responses can include raw and richer fields. If a field is unavailable, the normalizer should use stable empty values such as `null`, `[]`, or an empty string rather than omitting contract fields.

## Normalization Rules

The backend validates and normalizes Steam AppID input as a numeric string. If Steam returns `<appid>.success !== true`, collection fails with a stable not-found error and does not write to the repository.

The normalizer maps images, screenshots, pricing, platforms, genres, categories, developers, publishers, recommendations, release date, and descriptions from the Steam payload. Steam description fields often contain HTML, so normalized fields should be safe for plain text or controlled frontend rendering while the raw payload remains available for future refinements.

For the first implementation, `nameZh` falls back to the Steam `name` value. If a distinct Simplified Chinese name is unavailable, `sourceLanguageFallback` is `true`. A later change can add a second `l=schinese` request if the product needs language-specific names.

Supported languages should be parsed into structured capability records where practical. The original language string should be retained as `supportedLanguagesRaw` so no source information is lost when parsing cannot capture every nuance.

## Error Handling

The system should expose stable errors across backend and BFF boundaries:

- Invalid AppID input returns a bad-request style error.
- Steam `success: false` returns a not-found style error.
- Steam transport failures, malformed JSON, and unexpected response shape return a bad-gateway style error.
- Unknown detail queries return the existing not-found behavior.

Frontend collection errors are displayed inside the modal. List and detail errors continue using the existing workspace error states.

## Testing Strategy

Backend tests should cover AppID validation, Steam client response handling, normalizer mapping, `success: false`, malformed responses, repository seeding, duplicate AppID overwrite, list search, pagination, and detail lookup.

Shared API or BFF tests should cover `steam.collect` input validation, backend success mapping, backend error mapping, and query delegation for `steam.games` and `steam.detail`.

Frontend tests should stay focused: opening the modal, submitting a valid AppID, displaying loading and errors, invalidating the list after success, and selecting the collected game.

Verification should run the narrow tests first, then `openspec validate add-steam-game-metadata-collector`, and finally broader lint/build checks if implementation touches shared contracts.

## Non-Goals

- No real MongoDB connection in this change.
- No batch import, queueing, scheduling, retry dashboard, or background sync.
- No editing workflow for stored metadata.
- No authentication, permission, audit trail, or publishing workflow.
- No page-level AppID input outside the modal.
