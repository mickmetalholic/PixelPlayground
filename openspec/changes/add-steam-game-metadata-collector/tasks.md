## 1. Shared Contract and Backend Client Boundary

- [ ] 1.1 Extend shared Steam metadata types for collected appdetails fields, raw source retention, movies, packages, package groups, platform requirements, and supported language raw text.
- [ ] 1.2 Add `steam.collect` input/output contract to the shared tRPC router with numeric AppID validation.
- [ ] 1.3 Adapt `steam.games` and `steam.detail` router behavior so frontend BFF execution delegates to a backend Steam metadata client instead of frontend-local mock data.
- [ ] 1.4 Add stable error mapping for invalid AppID, missing Steam app, upstream Steam failures, and unknown stored details.

## 2. Backend Steam Metadata Module

- [ ] 2.1 Create a Nest `SteamMetadataModule` with controller, service, repository, Steam appdetails client, and normalizer boundaries.
- [ ] 2.2 Seed the in-memory repository with the existing seven mock records on backend startup.
- [ ] 2.3 Implement repository list, search, pagination, detail lookup, and AppID upsert operations.
- [ ] 2.4 Implement the Steam appdetails client for `https://store.steampowered.com/api/appdetails?appids=<appid>`.
- [ ] 2.5 Implement normalization from Steam appdetails `data` into the shared Steam metadata detail contract.
- [ ] 2.6 Preserve raw Steam appdetails source data while exposing safe normalized display fields.
- [ ] 2.7 Ensure duplicate AppID collection overwrites the stored record and refreshes `lastSyncedAt`.

## 3. Frontend BFF Integration

- [ ] 3.1 Add frontend server-side backend client methods for Steam list, detail, and collect operations.
- [ ] 3.2 Wire `steam.games` and `steam.detail` tRPC queries through the backend client.
- [ ] 3.3 Wire `steam.collect` tRPC mutation through the backend client.
- [ ] 3.4 Verify frontend BFF Steam procedures never call the Steam appdetails endpoint directly.

## 4. Steam Metadata Workspace UI

- [ ] 4.1 Add a compact collection button to the Steam metadata workspace header/status area.
- [ ] 4.2 Add a modal dialog for Steam AppID input, cancel, submit, loading, and error states.
- [ ] 4.3 Validate blank and non-numeric AppIDs before submitting the collection mutation.
- [ ] 4.4 On successful collection, close the modal, refresh list/detail queries, and select the collected game.
- [ ] 4.5 Update workspace source/status badges from local mock wording to backend in-memory and Steam API sync wording.
- [ ] 4.6 Keep AppID input out of the first-level workspace page outside the modal.

## 5. Tests

- [ ] 5.1 Add backend repository tests for seeding, search, pagination, detail lookup, new AppID insert, and duplicate AppID overwrite.
- [ ] 5.2 Add backend normalizer tests for successful appdetails payload mapping, language raw retention, safe fallback values, and raw payload preservation.
- [ ] 5.3 Add backend service/client tests for Steam `success: false`, malformed responses, and transport failure mapping.
- [ ] 5.4 Add shared tRPC/BFF tests for `steam.collect` validation, success mapping, backend error mapping, and backend delegation for list/detail.
- [ ] 5.5 Add focused frontend tests for opening the collection modal, submitting, loading, error display, success refresh, and selecting the collected game.

## 6. Verification

- [ ] 6.1 Run `pnpm --filter @pixel-playground/backend test` and fix failures.
- [ ] 6.2 Run `pnpm --filter @pixel-playground/api test` and fix failures.
- [ ] 6.3 Run `pnpm --filter @pixel-playground/frontend test` and fix failures.
- [ ] 6.4 Run `pnpm openspec validate add-steam-game-metadata-collector` and fix validation failures.
- [ ] 6.5 Run `pnpm lint` after implementation is complete and fix relevant issues.
- [ ] 6.6 Run `pnpm build` if shared contracts or package exports changed.
