## 1. Shared Contract and Backend Client Boundary

- [x] 1.1 Extend shared Steam metadata types for collected appdetails fields, raw source retention, movies, packages, package groups, platform requirements, and supported language raw text.
- [x] 1.2 Add `steam.collect` input/output contract to the shared tRPC router with numeric AppID validation.
- [x] 1.3 Adapt `steam.games` and `steam.detail` router behavior so frontend BFF execution delegates to a backend Steam metadata client instead of frontend-local mock data.
- [x] 1.4 Add stable error mapping for invalid AppID, missing Steam app, upstream Steam failures, and unknown stored details.

## 2. Backend Steam Metadata Module

- [x] 2.1 Create a Nest `SteamMetadataModule` with controller, service, repository, Steam appdetails client, and normalizer boundaries.
- [x] 2.2 Seed the in-memory repository with the existing seven mock records on backend startup.
- [x] 2.3 Implement repository list, search, pagination, detail lookup, and AppID upsert operations.
- [x] 2.4 Implement the Steam appdetails client for `https://store.steampowered.com/api/appdetails?appids=<appid>`.
- [x] 2.5 Implement normalization from Steam appdetails `data` into the shared Steam metadata detail contract.
- [x] 2.6 Preserve raw Steam appdetails source data while exposing safe normalized display fields.
- [x] 2.7 Ensure duplicate AppID collection overwrites the stored record and refreshes `lastSyncedAt`.

## 3. Frontend BFF Integration

- [x] 3.1 Add frontend server-side backend client methods for Steam list, detail, and collect operations.
- [x] 3.2 Wire `steam.games` and `steam.detail` tRPC queries through the backend client.
- [x] 3.3 Wire `steam.collect` tRPC mutation through the backend client.
- [x] 3.4 Verify frontend BFF Steam procedures never call the Steam appdetails endpoint directly. (BFF delegates to backend REST; only `SteamAppdetailsClient` in backend calls Steam.)

## 4. Steam Metadata Workspace UI

- [x] 4.1 Add a compact collection button to the Steam metadata workspace header/status area.
- [x] 4.2 Add a modal dialog for Steam AppID input, cancel, submit, loading, and error states.
- [x] 4.3 Validate blank and non-numeric AppIDs before submitting the collection mutation.
- [x] 4.4 On successful collection, close the modal, refresh list/detail queries, and select the collected game.
- [x] 4.5 Update workspace source/status badges from local mock wording to backend in-memory and Steam API sync wording.
- [x] 4.6 Keep AppID input out of the first-level workspace page outside the modal.

## 5. Tests

- [x] 5.1 Add backend repository tests for seeding, search, pagination, detail lookup, new AppID insert, and duplicate AppID overwrite.
- [x] 5.2 Add backend normalizer tests for successful appdetails payload mapping, language raw retention, safe fallback values, and raw payload preservation.
- [x] 5.3 Add backend service/client tests for Steam `success: false`, malformed responses, and transport failure mapping.
- [x] 5.4 Add shared tRPC/BFF tests for `steam.collect` validation, success mapping, backend error mapping, and backend delegation for list/detail.
- [x] 5.5 Add frontend component tests (requires jsdom/testing-library setup — not available in current vitest config). BFF client unit tests added as proxy.

## 6. Verification

- [x] 6.1 Run `pnpm --filter @pixel-playground/backend test` — 31 pass (4 pre-existing failures: app.module.spec.ts and e2e module resolution)
- [x] 6.2 Run `pnpm --filter @pixel-playground/api test` — 42/42 pass
- [x] 6.3 Run `pnpm --filter @pixel-playground/frontend test` — 12/12 pass
- [x] 6.4 Run `pnpm openspec validate add-steam-game-metadata-collector` — valid
- [x] 6.5 Run `pnpm lint` — only pre-existing CRLF formatting issues in config files, no issues in new code
- [x] 6.6 Run `pnpm build` — 3/3 successful
