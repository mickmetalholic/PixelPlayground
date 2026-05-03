# steam-game-metadata Specification

## Purpose
TBD - created by archiving change add-steam-game-metadata-bff. Update Purpose after archive.
## Requirements
### Requirement: Steam metadata workspace
The system SHALL render a Steam game metadata workspace at `/data-management/steam-game-metadata` using the existing workspace shell navigation and theme, including read/query surfaces and a modal-driven collection action.

#### Scenario: User opens the Steam metadata workspace
- **WHEN** the user navigates to `/data-management/steam-game-metadata`
- **THEN** the system displays a Steam game metadata management workspace instead of the placeholder panel

#### Scenario: Other workspace tools keep placeholder behavior
- **WHEN** the user navigates to a workspace tool that has not been implemented by this change
- **THEN** the system preserves the existing placeholder presentation for that tool

#### Scenario: User opens collection modal
- **WHEN** the user clicks the collection button in the Steam metadata workspace
- **THEN** the system opens a modal where the user can enter a Steam AppID

#### Scenario: Workspace keeps page-level controls focused
- **WHEN** the Steam metadata workspace is displayed
- **THEN** the first-level page shows a collection button but does not show a page-level AppID input field

### Requirement: tRPC-backed game list
The system SHALL expose a `steam.games` tRPC query as the authoritative source for Steam game list results through the existing frontend `/api/trpc` route, backed by the Nest backend Steam metadata repository.

#### Scenario: Empty list query returns stored games
- **WHEN** a client calls `steam.games` without a search query
- **THEN** the system returns a typed response containing stored Steam games and page information from the backend repository

#### Scenario: List response contains summary metadata
- **WHEN** a client calls `steam.games`
- **THEN** each returned item includes SteamID, English name, Chinese name, complete capsule image, header image, release date, publisher/developer metadata, platform metadata, last sync timestamp, and price or free-state metadata

#### Scenario: Frontend does not use dedicated Steam REST routes
- **WHEN** the frontend loads Steam metadata list results
- **THEN** it uses the shared tRPC client rather than calling dedicated `/api/steam/*` route handlers

#### Scenario: BFF delegates list query to backend
- **WHEN** a client calls `steam.games` through the frontend `/api/trpc` route
- **THEN** the frontend BFF obtains list results from the Nest backend Steam metadata repository boundary

### Requirement: Frontend BFF serves Steam mock data locally
The system SHALL resolve Steam metadata tRPC requests inside the frontend `/api/trpc` BFF route by delegating to the Nest backend Steam metadata capability rather than reading frontend-local mock data.

#### Scenario: Steam list uses Nest backend
- **WHEN** a client calls `steam.games` through the frontend `/api/trpc` route
- **THEN** the system returns data from the Nest backend Steam metadata repository

#### Scenario: Steam detail uses Nest backend
- **WHEN** a client calls `steam.detail` through the frontend `/api/trpc` route
- **THEN** the system returns detail data from the Nest backend Steam metadata repository

#### Scenario: BFF does not call Steam directly
- **WHEN** the frontend BFF handles Steam metadata list, detail, or collection requests
- **THEN** it does not call the Steam appdetails endpoint directly

### Requirement: tRPC-side search
The system SHALL filter Steam game list results by SteamID, English name, or Chinese name through the backend-backed Steam metadata query path.

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
The system SHALL expose a `steam.detail` tRPC query for loading a selected Steam game's full metadata detail from the backend Steam metadata repository.

#### Scenario: Existing SteamID returns detail
- **WHEN** a client calls `steam.detail` with input `{ steamId: "1091500" }`
- **THEN** the system returns the full metadata detail for Steam app `1091500`
- **AND** supported languages are returned as structured language capability records with `name`, `interface`, `fullAudio`, and `subtitles` fields when those capabilities can be parsed

#### Scenario: Unknown SteamID returns not found
- **WHEN** a client calls `steam.detail` with input `{ steamId: "unknown" }`
- **THEN** the system returns a typed tRPC not-found error with error code `STEAM_GAME_NOT_FOUND`

### Requirement: Fixed mock data source
The system MUST use the existing fixed local mock metadata as the initial seed for the backend in-memory repository, while serving runtime Steam metadata list and detail results from that backend repository.

#### Scenario: Runtime list and detail do not call Steam
- **WHEN** a client requests the list or detail tRPC procedures
- **THEN** the system serves data from the backend in-memory repository without making a runtime request to Steam

#### Scenario: Seed data includes requested app IDs
- **WHEN** the backend in-memory repository is initialized
- **THEN** it can return records for app IDs `1091500`, `570`, `578080`, `2868840`, `2507950`, `271590`, and `413150`

#### Scenario: Runtime collection can call Steam
- **WHEN** a client submits `steam.collect` for a valid AppID
- **THEN** the backend may call the Steam appdetails endpoint for that explicit collection request

### Requirement: Chinese name fallback
The system SHALL provide a non-empty Chinese display name for every game, using the English name when a distinct Simplified Chinese name is unavailable.

#### Scenario: Simplified Chinese name is unavailable
- **WHEN** a game record lacks a distinct Simplified Chinese name
- **THEN** the system sets `nameZh` to the English name and marks the record as using a language fallback

### Requirement: Game list and detail interaction
The frontend SHALL display tRPC list results, show the selected game's detail in a right-side detail panel on desktop layouts, and refresh selection after successful collection.

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

#### Scenario: Collected game becomes selected
- **WHEN** collection succeeds for a Steam AppID
- **THEN** the frontend refreshes list results
- **AND** selects the collected game in the detail panel

### Requirement: User-facing states
The frontend SHALL render clear loading, empty, error, image fallback, detail not-found, and collection modal states.

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

#### Scenario: Collection is submitting
- **WHEN** the user submits the collection modal
- **THEN** the modal displays a loading state and prevents duplicate collection submissions

#### Scenario: Collection fails
- **WHEN** the collection mutation returns an error
- **THEN** the modal remains open and displays the error without changing the current list selection

### Requirement: Professional admin UI
The frontend SHALL present the Steam metadata workspace as a professional, data-dense admin interface consistent with the existing PixelPlayground workspace visual system, with collection contained in a modal flow.

#### Scenario: Desktop metadata review
- **WHEN** the workspace is displayed on a desktop viewport
- **THEN** the system presents a compact list or table area with complete capsule images, combined English/Chinese names, platform icons, sync freshness status, and a right-side detail panel for repeated metadata review

#### Scenario: Detail panel shows rich metadata
- **WHEN** a selected game's detail is loaded
- **THEN** the detail panel shows available names, images, status, IDs, people, release date, commercial data, platforms, genres, categories, languages, recommendations, descriptions, screenshots, store link, last sync timestamp, and fallback indicators without truncating key fields unnecessarily
- **AND** language support is displayed from structured capability data rather than as a single raw text blob when structured capability data is available

#### Scenario: Collection action is compact
- **WHEN** the workspace header is displayed
- **THEN** the system shows a collection button without exposing the AppID input outside the collection modal

#### Scenario: Desktop workspace keeps scrolling inside content panes
- **WHEN** the workspace is displayed on a desktop viewport
- **THEN** the system uses the available content width, avoids page-level scrolling for normal metadata review, and keeps list and detail overflow inside styled internal scroll containers

#### Scenario: Description text uses contained reading areas
- **WHEN** the selected game's short or detailed description is long
- **THEN** the system displays each description in a bordered readable container with styled internal scrolling instead of expanding the whole page

#### Scenario: Mobile metadata review
- **WHEN** the workspace is displayed on a narrow viewport
- **THEN** the system uses a single-column layout without horizontal page scrolling

### Requirement: tRPC-backed Steam metadata collection
The system SHALL expose a `steam.collect` tRPC mutation through the frontend `/api/trpc` route for collecting a Steam game's metadata by AppID.

#### Scenario: User collects a valid Steam AppID
- **WHEN** a client calls `steam.collect` with input `{ steamId: "1091500" }`
- **THEN** the system requests collection through the Nest backend
- **AND** returns the normalized detail record for Steam app `1091500`

#### Scenario: Invalid AppID is rejected
- **WHEN** a client calls `steam.collect` with a blank or non-numeric `steamId`
- **THEN** the system returns a typed validation error without calling the Nest backend or Steam API

#### Scenario: Steam reports missing app
- **WHEN** Steam appdetails returns `success: false` for the requested AppID
- **THEN** the system returns a typed not-found error
- **AND** does not write a record for that AppID

#### Scenario: Steam collection transport fails
- **WHEN** the Nest backend cannot fetch or parse the Steam appdetails response
- **THEN** the system returns a stable upstream failure error through the frontend BFF
- **AND** preserves the existing stored record, if one exists

### Requirement: Backend Steam appdetails collector
The Nest backend SHALL collect Steam game metadata from `https://store.steampowered.com/api/appdetails?appids=<appid>` during explicit collection requests.

#### Scenario: Backend fetches Steam appdetails
- **WHEN** the backend receives a valid collection request for AppID `1091500`
- **THEN** it calls the Steam appdetails endpoint with `appids=1091500`

#### Scenario: Collection is explicit
- **WHEN** a user only loads, searches, or opens existing game detail
- **THEN** the backend does not call the Steam appdetails endpoint

### Requirement: Backend metadata normalization
The backend SHALL normalize Steam appdetails responses into the shared Steam game metadata detail contract and preserve source information needed for future field expansion.

#### Scenario: Appdetails response is normalized
- **WHEN** Steam returns a successful appdetails payload
- **THEN** the backend stores structured identity, descriptions, media, developers, publishers, genres, categories, price, packages, platforms, requirements, languages, release date, recommendations, store URL, metadata status, and sync timestamp fields

#### Scenario: Raw source payload is retained
- **WHEN** the backend stores a successfully collected game
- **THEN** the stored detail record includes the raw Steam appdetails `data` payload or an equivalent raw source field

#### Scenario: Languages are partially parseable
- **WHEN** Steam returns supported languages in an HTML-like string
- **THEN** the backend stores structured language capabilities where practical
- **AND** preserves the original language string for information not captured by parsing

### Requirement: Backend in-memory Steam metadata repository
The Nest backend SHALL store Steam game metadata in an in-memory repository for the first implementation.

#### Scenario: Repository starts with existing mock games
- **WHEN** the backend starts
- **THEN** the in-memory repository contains records for app IDs `1091500`, `570`, `578080`, `2868840`, `2507950`, `271590`, and `413150`

#### Scenario: Collection upserts by AppID
- **WHEN** collection succeeds for an AppID that already exists in the repository
- **THEN** the backend overwrites the stored normalized record for that AppID
- **AND** updates `lastSyncedAt`

#### Scenario: Collection adds a new AppID
- **WHEN** collection succeeds for an AppID that does not exist in the repository
- **THEN** the backend stores the new normalized game record
- **AND** future list and detail queries can return it

