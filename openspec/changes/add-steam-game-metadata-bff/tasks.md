## 1. Steam Metadata Data Boundary

- [ ] 1.1 Add typed Steam metadata interfaces for list summaries, detail records, price metadata, platform support, pagination, and stable error responses.
- [ ] 1.2 Create fixed local mock records for Steam app IDs `1091500`, `570`, `578080`, `2868840`, `2507950`, `271590`, and `413150`.
- [ ] 1.3 Normalize mock records so every game has `nameEn`, non-empty `nameZh`, `sourceLanguageFallback`, images, store URL, and detail metadata needed by the UI.
- [ ] 1.4 Add pure search and pagination helpers for SteamID, English name, Chinese name, `limit`, and offset cursor handling.

## 2. BFF Route Handlers

- [ ] 2.1 Implement `GET /api/steam/games` to validate query parameters, search local mock data on the BFF side, and return `{ items, pageInfo, query, total }`.
- [ ] 2.2 Implement `GET /api/steam/games/[steamId]` to return a full detail record for known SteamIDs.
- [ ] 2.3 Return stable JSON errors for invalid list parameters, unknown detail SteamIDs, and unexpected BFF failures without exposing stack traces or local paths.
- [ ] 2.4 Verify the BFF route handlers do not perform runtime Steam, Nest, or database calls.

## 3. Workspace Rendering

- [ ] 3.1 Refactor `WorkspaceShell` so shared header, section navigation, and sidebar remain common while tool-specific content can be delegated.
- [ ] 3.2 Render the Steam metadata workspace component for `/data-management/steam-game-metadata`.
- [ ] 3.3 Preserve existing placeholder behavior for workspace tools that are not implemented by this change.

## 4. Steam Metadata UI

- [ ] 4.1 Build the professional data-dense Steam metadata workspace layout with title/status area, BFF-backed search, result list, and right-side detail panel.
- [ ] 4.2 Display list summary fields including cover image, SteamID, English name, Chinese name, release date, publisher/developer metadata, platform metadata, and price/free state.
- [ ] 4.3 Display detail fields including header image, cover image, names, SteamID, developers, publishers, release date, price, platforms, genres/categories, recommendations, descriptions, screenshots, store link, last sync timestamp, and fallback indicator.
- [ ] 4.4 Add desktop selected-row, hover, focus, and `cursor-pointer` interaction states without layout shift.
- [ ] 4.5 Add responsive mobile behavior that uses a single-column layout without horizontal page scrolling.

## 5. Frontend State Handling

- [ ] 5.1 Fetch list results through `GET /api/steam/games` and keep browser-side filtering out of the authoritative search path.
- [ ] 5.2 Sync the search query with the URL query string and preserve search context across refresh.
- [ ] 5.3 Select the first result by default and update selection when a search removes the current item.
- [ ] 5.4 Fetch selected-game detail through `GET /api/steam/games/[steamId]`.
- [ ] 5.5 Render clear loading, empty result, list error, detail not-found, detail error, retry, and image fallback states.

## 6. Tests and Verification

- [ ] 6.1 Add pure helper tests for SteamID search, English-name search, Chinese-name search, empty query, limit handling, cursor/pageInfo shape, and Chinese-name fallback.
- [ ] 6.2 Add route handler tests for list success, invalid list parameters, detail success, and detail 404 JSON.
- [ ] 6.3 Add focused frontend tests for query construction, empty result handling, and selection fallback where practical in the existing frontend test style.
- [ ] 6.4 Run `pnpm --filter @pixel-playground/frontend test` and fix failures.
- [ ] 6.5 Run `pnpm lint` and fix failures.
- [ ] 6.6 Run `pnpm build` if the focused tests and lint pass, and fix build failures.

## 7. Documentation and Spec Follow-up

- [ ] 7.1 Update related implementation notes or README content only if the final route contract or local development workflow differs from this change.
- [ ] 7.2 Run `openspec validate add-steam-game-metadata-bff` after implementation changes and resolve any validation failures.
