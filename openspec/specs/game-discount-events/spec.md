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

### Requirement: Backend discount event module
The system SHALL provide a Nest backend game discount events module that exposes mock-backed discount event reads through a service boundary.

#### Scenario: Backend module reads mock discount events
- **WHEN** the backend discount event list is requested
- **THEN** the system returns fixed mock discount events without requiring a database or live Steam discount feed

#### Scenario: Backend module joins game metadata
- **WHEN** the backend discount event list is requested
- **THEN** returned discount event items include associated game summary fields for events whose Steam IDs exist in stored Steam game metadata

#### Scenario: Backend module excludes orphan events
- **WHEN** a mock discount event references a Steam ID that cannot be associated with game metadata
- **THEN** the backend discount event list excludes that event from joined results

### Requirement: Current discount event filtering
The system SHALL support filtering discount events to the currently active discount window for downstream content workflows.

#### Scenario: Current event is active
- **WHEN** a discount event has `startAt` less than or equal to the current time and `endAt` greater than the current time
- **THEN** the event is eligible for current discount event results

#### Scenario: Expired event is inactive
- **WHEN** a discount event has `endAt` less than or equal to the current time
- **THEN** the event is excluded from current discount event results

#### Scenario: Future event is inactive
- **WHEN** a discount event has `startAt` greater than the current time
- **THEN** the event is excluded from current discount event results

### Requirement: Backend-backed discount event tRPC path
The system SHALL resolve discount event tRPC reads through the Nest backend service boundary when backend services are available.

#### Scenario: Frontend BFF delegates discount event list
- **WHEN** a client calls the discount event list tRPC procedure through the frontend BFF and the backend is configured
- **THEN** the frontend BFF obtains discount event results from the Nest backend discount event service boundary

#### Scenario: Backend tRPC serves automation callers
- **WHEN** an external automation caller invokes the backend tRPC discount event list procedure
- **THEN** the backend returns the typed discount event list response from the backend discount event service

