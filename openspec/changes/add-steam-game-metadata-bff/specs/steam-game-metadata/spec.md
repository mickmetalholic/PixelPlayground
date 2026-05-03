## ADDED Requirements

### Requirement: Steam metadata workspace
The system SHALL render a read-only Steam game metadata workspace at `/data-management/steam-game-metadata` using the existing workspace shell navigation and theme.

#### Scenario: User opens the Steam metadata workspace
- **WHEN** the user navigates to `/data-management/steam-game-metadata`
- **THEN** the system displays a Steam game metadata management workspace instead of the placeholder panel

#### Scenario: Other workspace tools keep placeholder behavior
- **WHEN** the user navigates to a workspace tool that has not been implemented by this change
- **THEN** the system preserves the existing placeholder presentation for that tool

### Requirement: BFF-backed game list
The system SHALL expose `GET /api/steam/games` as the authoritative source for Steam game list results.

#### Scenario: Empty list query returns mock games
- **WHEN** a client requests `GET /api/steam/games` without a search query
- **THEN** the system returns a JSON response containing the fixed mock Steam games and page information

#### Scenario: List response contains summary metadata
- **WHEN** a client requests `GET /api/steam/games`
- **THEN** each returned item includes SteamID, English name, Chinese name, cover image, header image, release date, publisher/developer metadata, platform metadata, and price or free-state metadata

### Requirement: BFF-side search
The system SHALL filter Steam game list results on the BFF side by SteamID, English name, or Chinese name.

#### Scenario: Search by SteamID
- **WHEN** a client requests `GET /api/steam/games?q=1091500`
- **THEN** the system returns matching game results whose SteamID includes `1091500`

#### Scenario: Search by English name
- **WHEN** a client requests `GET /api/steam/games?q=cyberpunk`
- **THEN** the system returns matching game results whose English name includes `cyberpunk`, ignoring case

#### Scenario: Search by Chinese name
- **WHEN** a client requests `GET /api/steam/games?q=赛博朋克`
- **THEN** the system returns matching game results whose Chinese name includes `赛博朋克`

### Requirement: List pagination shape
The system SHALL support `limit` and `cursor` query parameters on `GET /api/steam/games` and return stable pagination metadata.

#### Scenario: Limit restricts result count
- **WHEN** a client requests `GET /api/steam/games?limit=2`
- **THEN** the system returns at most two game items and page information containing the effective limit

#### Scenario: Invalid pagination parameter
- **WHEN** a client requests `GET /api/steam/games?limit=invalid`
- **THEN** the system returns a 400 response with stable JSON error content

### Requirement: BFF-backed game detail
The system SHALL expose `GET /api/steam/games/[steamId]` for loading a selected Steam game's full metadata detail.

#### Scenario: Existing SteamID returns detail
- **WHEN** a client requests `GET /api/steam/games/1091500`
- **THEN** the system returns the full metadata detail for Steam app `1091500`

#### Scenario: Unknown SteamID returns not found
- **WHEN** a client requests `GET /api/steam/games/unknown`
- **THEN** the system returns a 404 response with error code `STEAM_GAME_NOT_FOUND`

### Requirement: Fixed mock data source
The system MUST use fixed local mock metadata for app IDs `1091500`, `570`, `578080`, `2868840`, `2507950`, `271590`, and `413150` in the first implementation.

#### Scenario: Runtime does not call Steam
- **WHEN** a client requests the list or detail BFF endpoints
- **THEN** the system serves data from the local mock metadata source without making a runtime request to Steam

#### Scenario: Mock data includes requested app IDs
- **WHEN** a client requests the unfiltered game list
- **THEN** the system can return records for app IDs `1091500`, `570`, `578080`, `2868840`, `2507950`, `271590`, and `413150`

### Requirement: Chinese name fallback
The system SHALL provide a non-empty Chinese display name for every game, using the English name when a distinct Simplified Chinese name is unavailable.

#### Scenario: Simplified Chinese name is unavailable
- **WHEN** a game record lacks a distinct Simplified Chinese name
- **THEN** the system sets `nameZh` to the English name and marks the record as using a language fallback

### Requirement: Game list and detail interaction
The frontend SHALL display BFF list results and show the selected game's detail in a right-side detail panel on desktop layouts.

#### Scenario: User selects a game row
- **WHEN** the user clicks a game in the list
- **THEN** the detail panel displays fuller metadata for the selected game

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
- **WHEN** the list BFF request fails
- **THEN** the system displays an error state with a retry action

#### Scenario: Detail request returns not found
- **WHEN** the selected game's detail request returns 404
- **THEN** the detail panel displays a not-found state

#### Scenario: Game image fails to load
- **WHEN** a game cover or header image fails to load
- **THEN** the system displays a stable visual placeholder without shifting the row or detail layout

### Requirement: Professional admin UI
The frontend SHALL present the Steam metadata workspace as a professional, data-dense admin interface consistent with the existing PixelPlayground workspace visual system.

#### Scenario: Desktop metadata review
- **WHEN** the workspace is displayed on a desktop viewport
- **THEN** the system presents a compact list or table area with a right-side detail panel for repeated metadata review

#### Scenario: Mobile metadata review
- **WHEN** the workspace is displayed on a narrow viewport
- **THEN** the system uses a single-column layout without horizontal page scrolling
