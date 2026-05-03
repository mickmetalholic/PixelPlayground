## 1. Steam Metadata Data Boundary

- [x] 1.1 Add typed Steam metadata interfaces for list summaries, detail records, price metadata, platform support, last sync timestamp, pagination, and stable error responses.
- [x] 1.2 Create fixed local mock records for Steam app IDs `1091500`, `570`, `578080`, `2868840`, `2507950`, `271590`, and `413150`.
- [x] 1.3 Normalize mock records so every game has `nameEn`, non-empty `nameZh`, `sourceLanguageFallback`, images, store URL, and detail metadata needed by the UI.
- [x] 1.4 Add pure search and pagination helpers for SteamID, English name, Chinese name, `limit`, and offset cursor handling.

## 2. tRPC Router Implementation

- [x] 2.1 Implement tRPC `steam.games` procedure with input validation, search, pagination, and return `{ items, pageInfo, query, total }`.
- [x] 2.2 Implement tRPC `steam.detail` procedure to return full detail record for known SteamIDs.
- [x] 2.3 Return stable TRPCError for unknown detail SteamIDs without exposing stack traces.
- [x] 2.4 Verify the tRPC routers do not perform runtime Steam, Nest, or database calls.
- [x] 2.5 Ensure the frontend `/api/trpc` BFF resolves `steam.games` and `steam.detail` locally from mock data without forwarding to the Nest backend or backend `/trpc` upstream.

## 3. Workspace Rendering

- [x] 3.1 Refactor `WorkspaceShell` so shared header, section navigation, and sidebar remain common while tool-specific content can be delegated.
- [x] 3.2 Render the Steam metadata workspace component for `/data-management/steam-game-metadata`.
- [x] 3.3 Preserve existing placeholder behavior for workspace tools that are not implemented by this change.

## 4. Steam Metadata UI

- [x] 4.1 Build the professional data-dense Steam metadata workspace layout with title/status area, tRPC-backed search, result list, and right-side detail panel.
- [x] 4.2 Display list summary fields including complete capsule image, SteamID, combined English/Chinese name column, release date, publisher/developer metadata, platform icons, last sync freshness status, and price/free state.
- [x] 4.3 Display detail fields including header image, complete capsule image, names, SteamID, metadata status, developers, publishers, release date, price internals, platforms, genres/categories, supported languages, recommendations, descriptions, screenshots, store link, last sync timestamp, and fallback indicator.
- [x] 4.4 Add desktop selected-row, hover, focus, and `cursor-pointer` interaction states without layout shift.
- [x] 4.5 Add responsive mobile behavior that uses a single-column layout without horizontal page scrolling.
- [x] 4.6 Expand the Steam metadata workspace to use the available shell content width and keep table/detail scrolling inside styled internal panes.
- [x] 4.7 Display short and detailed descriptions in contained readable blocks with styled internal scrolling.

## 5. Frontend State Handling

- [x] 5.1 Fetch list results through `trpc.steam.games.useQuery` and keep browser-side filtering out of the authoritative search path.
- [x] 5.2 Sync the search query with the URL query string and preserve search context across refresh.
- [x] 5.3 Select the first result by default and update selection when a search removes the current item.
- [x] 5.4 Fetch selected-game detail through `trpc.steam.detail.useQuery`.
- [x] 5.5 Render clear loading, empty result, list error, detail not-found, detail error, retry, and image fallback states.

## 6. Tests and Verification

- [x] 6.1 Add pure helper tests for SteamID search, English-name search, Chinese-name search, empty query, limit handling, cursor/pageInfo shape, and Chinese-name fallback.
- [x] 6.2 Add tRPC router tests for list success, invalid parameters, detail success, and detail NOT_FOUND.
- [x] 6.3 Add mock data validation tests for completeness and structure.
- [x] 6.4 Run `pnpm --filter @pixel-playground/api test` and fix failures.
- [x] 6.5 Run `pnpm lint` and fix failures.
- [x] 6.6 Run `pnpm build` and fix build failures.

## 7. Documentation and Spec Follow-up

- [x] 7.1 Update related implementation notes or README content only if the final route contract or local development workflow differs from this change.
- [x] 7.2 Run `openspec validate add-steam-game-metadata-bff` after implementation changes and resolve any validation failures.
