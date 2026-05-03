## ADDED Requirements

### Requirement: Steam metadata workspace
The system SHALL render a read-only Steam game metadata workspace at `/data-management/steam-game-metadata` using the existing workspace shell navigation and theme.

#### Scenario: User opens the Steam metadata workspace
- **WHEN** the user navigates to `/data-management/steam-game-metadata`
- **THEN** the system displays a Steam game metadata management workspace instead of the placeholder panel

#### Scenario: Other workspace tools keep placeholder behavior
- **WHEN** the user navigates to a workspace tool that has not been implemented by this change
- **THEN** the system preserves the existing placeholder presentation for that tool

### Requirement: tRPC-backed game list
The system SHALL expose a `steam.games` tRPC query as the authoritative source for Steam game list results through the existing frontend `/api/trpc` route.

#### Scenario: Empty list query returns mock games
- **WHEN** a client calls `steam.games` without a search query
- **THEN** the system returns a typed response containing the fixed mock Steam games and page information

#### Scenario: List response contains summary metadata
- **WHEN** a client calls `steam.games`
- **THEN** each returned item includes SteamID, English name, Chinese name, complete capsule image, header image, release date, publisher/developer metadata, platform metadata, last sync timestamp, and price or free-state metadata

#### Scenario: Frontend does not use dedicated Steam REST routes
- **WHEN** the frontend loads Steam metadata list results
- **THEN** it uses the shared tRPC client rather than calling dedicated `/api/steam/*` route handlers

### Requirement: Frontend BFF serves Steam mock data locally
The system SHALL resolve Steam metadata tRPC requests inside the frontend `/api/trpc` BFF route using fixed local mock data in the first implementation.

#### Scenario: Steam list does not require Nest
- **WHEN** a client calls `steam.games` through the frontend `/api/trpc` route
- **THEN** the system returns fixed mock data without forwarding the request to the Nest backend or any backend `/trpc` upstream

#### Scenario: Steam detail does not require Nest
- **WHEN** a client calls `steam.detail` through the frontend `/api/trpc` route
- **THEN** the system returns fixed mock detail data without forwarding the request to the Nest backend or any backend `/trpc` upstream

### Requirement: tRPC-side search
The system SHALL filter Steam game list results in the shared tRPC procedure layer by SteamID, English name, or Chinese name.

#### Scenario: Search by SteamID
- **WHEN** a client calls `steam.games` with input `{ q: "1091500" }`
- **THEN** the system returns matching game results whose SteamID includes `1091500`

#### Scenario: Search by English name
- **WHEN** a client calls `steam.games` with input `{ q: "cyberpunk" }`
- **THEN** the system returns matching game results whose English name includes `cyberpunk`, ignoring case

#### Scenario: Search by Chinese name
- **WHEN** a client calls `steam.games` with input `{ q: "赛博朋克" }`
- **THEN** the system returns matching game results whose Chinese name includes `赛博朋克`

### Requirement: List pagination shape
The system SHALL support `limit` and `cursor` inputs on the `steam.games` tRPC query and return stable pagination metadata.

#### Scenario: Limit restricts result count
- **WHEN** a client calls `steam.games` with input `{ limit: 2 }`
- **THEN** the system returns at most two game items and page information containing the effective limit

#### Scenario: Invalid pagination parameter
- **WHEN** a client calls `steam.games` with an invalid `limit`
- **THEN** the system returns a typed tRPC validation error with stable error content

### Requirement: tRPC-backed game detail
The system SHALL expose a `steam.detail` tRPC query for loading a selected Steam game's full metadata detail.

#### Scenario: Existing SteamID returns detail
- **WHEN** a client calls `steam.detail` with input `{ steamId: "1091500" }`
- **THEN** the system returns the full metadata detail for Steam app `1091500`
- **AND** supported languages are returned as structured language capability records with `name`, `interface`, `fullAudio`, and `subtitles` fields

#### Scenario: Unknown SteamID returns not found
- **WHEN** a client calls `steam.detail` with input `{ steamId: "unknown" }`
- **THEN** the system returns a typed tRPC not-found error with error code `STEAM_GAME_NOT_FOUND`

### Requirement: Fixed mock data source
The system MUST use fixed local mock metadata for app IDs `1091500`, `570`, `578080`, `2868840`, `2507950`, `271590`, and `413150` in the first implementation.

#### Scenario: Runtime does not call Steam
- **WHEN** a client requests the list or detail tRPC procedures
- **THEN** the system serves data from the local mock metadata source without making a runtime request to Steam, Nest, a backend tRPC upstream, or a database

#### Scenario: Mock data includes requested app IDs
- **WHEN** a client requests the unfiltered game list
- **THEN** the system can return records for app IDs `1091500`, `570`, `578080`, `2868840`, `2507950`, `271590`, and `413150`

### Requirement: Chinese name fallback
The system SHALL provide a non-empty Chinese display name for every game, using the English name when a distinct Simplified Chinese name is unavailable.

#### Scenario: Simplified Chinese name is unavailable
- **WHEN** a game record lacks a distinct Simplified Chinese name
- **THEN** the system sets `nameZh` to the English name and marks the record as using a language fallback

### Requirement: Game list and detail interaction
The frontend SHALL display tRPC list results and show the selected game's detail in a right-side detail panel on desktop layouts.

#### Scenario: User selects a game row
- **WHEN** the user clicks a game in the list
- **THEN** the detail panel displays fuller metadata for the selected game

#### Scenario: List displays sync freshness
- **WHEN** the game list is displayed
- **THEN** each row displays the game's last sync age using a visual status color based on freshness

#### Scenario: First result is selected by default
- **WHEN** the workspace loads and the game list contains results
- **THEN** the system selects the first result by default

#### Scenario: Selected game disappears after search
- **WHEN** a new search result set does not include the currently selected game
- **THEN** the system selects the first returned game or clears the detail panel if the result set is empty

### Requirement: User-facing states
The frontend SHALL render clear loading, empty, error, image fallback, and detail not-found states.

#### Scenario: Search returns no games
- **WHEN** the user searches for a query with no matching games
- **THEN** the system displays an empty result state and a neutral detail state

#### Scenario: List request fails
- **WHEN** the list tRPC request fails
- **THEN** the system displays an error state with a retry action

#### Scenario: Detail request returns not found
- **WHEN** the selected game's detail tRPC request returns not found
- **THEN** the detail panel displays a not-found state

#### Scenario: Game image fails to load
- **WHEN** a game cover, header image, or screenshot fails to load
- **THEN** the system displays a stable visual placeholder without shifting the row or detail layout

### Requirement: Professional admin UI
The frontend SHALL present the Steam metadata workspace as a professional, data-dense admin interface consistent with the existing PixelPlayground workspace visual system.

#### Scenario: Desktop metadata review
- **WHEN** the workspace is displayed on a desktop viewport
- **THEN** the system presents a compact list or table area with complete capsule images, combined English/Chinese names, platform icons, sync freshness status, and a right-side detail panel for repeated metadata review

#### Scenario: Detail panel shows rich metadata
- **WHEN** a selected game's detail is loaded
- **THEN** the detail panel shows available names, images, status, IDs, people, release date, commercial data, platforms, genres, categories, languages, recommendations, descriptions, screenshots, store link, last sync timestamp, and fallback indicators without truncating key fields unnecessarily
- **AND** language support is displayed from structured capability data rather than as a single raw text blob

#### Scenario: Desktop workspace keeps scrolling inside content panes
- **WHEN** the workspace is displayed on a desktop viewport
- **THEN** the system uses the available content width, avoids page-level scrolling for normal metadata review, and keeps list and detail overflow inside styled internal scroll containers

#### Scenario: Description text uses contained reading areas
- **WHEN** the selected game's short or detailed description is long
- **THEN** the system displays each description in a bordered readable container with styled internal scrolling instead of expanding the whole page

#### Scenario: Mobile metadata review
- **WHEN** the workspace is displayed on a narrow viewport
- **THEN** the system uses a single-column layout without horizontal page scrolling
