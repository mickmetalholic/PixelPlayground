# game-discount-events Specification

## Purpose
TBD - created by archiving change add-game-discount-events. Update Purpose after archive.
## Requirements
### Requirement: Game discount event contract
The system SHALL model game discount events with an identifier, Steam game foreign key, discount start and end timestamps, discount percent, discounted price, and historic-low classification.

#### Scenario: Event contains required fields
- **WHEN** a game discount event is returned by the system
- **THEN** it includes `id`, `steamId`, `startAt`, `endAt`, `discountPercent`, `discountedPrice`, and `type`

#### Scenario: Event type is classified
- **WHEN** a game discount event is returned by the system
- **THEN** `type` is one of `nonHistoricLow`, `historicLow`, or `newHistoricLow`

#### Scenario: Discounted price uses integer minor units
- **WHEN** a game discount event includes a discounted price
- **THEN** the price includes a currency and integer minor-unit final amount

### Requirement: Mock game discount event source
The system SHALL provide fixed in-memory mock game discount events for the first implementation.

#### Scenario: Mock events are available without a database
- **WHEN** the game discount event list is requested in the first implementation
- **THEN** the system returns fixed mock discount event records without requiring a database

#### Scenario: Mock events reference existing games
- **WHEN** mock discount events are listed
- **THEN** returned events reference Steam IDs that can be associated with existing mock Steam game metadata

### Requirement: tRPC-backed discount event list
The system SHALL expose a `steam.discountEvents` tRPC query that returns game discount events with associated game summary data.

#### Scenario: Empty list query returns joined event rows
- **WHEN** a client calls `steam.discountEvents` without filters
- **THEN** the system returns discount event list items that include discount event fields and associated game summary fields

#### Scenario: Events are sorted by start time
- **WHEN** a client calls `steam.discountEvents`
- **THEN** returned items are sorted by `startAt` descending before pagination

#### Scenario: Limit restricts event count
- **WHEN** a client calls `steam.discountEvents` with input `{ limit: 2 }`
- **THEN** the system returns at most two event items and page information containing the effective limit

#### Scenario: Orphan mock event is not returned
- **WHEN** a mock discount event references a missing Steam game
- **THEN** the event is excluded from the returned list

### Requirement: Discount event data-management workspace
The system SHALL render a read-only game discount event management workspace at `/data-management/game-discount-events`.

#### Scenario: User opens discount event workspace
- **WHEN** the user navigates to `/data-management/game-discount-events`
- **THEN** the system displays a game discount event management workspace instead of the placeholder panel

#### Scenario: Sidebar exposes discount event workspace
- **WHEN** the Data Management section is displayed
- **THEN** the sidebar includes a `Game Discount Event Management` item linking to `/data-management/game-discount-events`

#### Scenario: Workspace uses read-only list
- **WHEN** discount events are displayed
- **THEN** the workspace presents the events in a read-only list or table without create, edit, or delete controls

### Requirement: Associated game information display
The frontend SHALL display associated game information in each discount event row.

#### Scenario: Row shows game identity
- **WHEN** a discount event row is displayed
- **THEN** it shows the associated game's Steam ID, English name, Chinese name, and capsule image

#### Scenario: Row shows discount fields
- **WHEN** a discount event row is displayed
- **THEN** it shows start time, end time, discount percent, discounted price, and historic-low type

#### Scenario: Historic-low type uses readable labels
- **WHEN** a discount event row is displayed
- **THEN** `nonHistoricLow`, `historicLow`, and `newHistoricLow` are displayed as readable labels for non-historic-low, historic-low, and new-historic-low events

### Requirement: Discount event user-facing states
The frontend SHALL render loading, empty, and error states for the discount event workspace.

#### Scenario: List request is loading
- **WHEN** the discount event list query is pending
- **THEN** the workspace displays a loading state

#### Scenario: List request fails
- **WHEN** the discount event list query fails
- **THEN** the workspace displays an error state with a retry action

#### Scenario: List is empty
- **WHEN** the discount event list query returns no items
- **THEN** the workspace displays an empty state
