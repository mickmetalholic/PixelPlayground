## ADDED Requirements

### Requirement: Discount news entry contract
The system SHALL model game discount news entries as backend-owned draft records with stable identifiers, status, timestamps, and selected discount event IDs.

#### Scenario: Draft contains required fields
- **WHEN** a game discount news draft is returned by the system
- **THEN** it includes `id`, `status`, `selectedDiscountEventIds`, `createdAt`, and `updatedAt`

#### Scenario: Status is constrained
- **WHEN** a game discount news entry is returned by the system
- **THEN** `status` is one of `draft`, `readyForContent`, `published`, or `archived`

#### Scenario: New draft has no selected events
- **WHEN** a game discount news draft is created
- **THEN** the new draft has status `draft` and an empty `selectedDiscountEventIds` list

### Requirement: Backend discount news module
The system SHALL provide a Nest backend game discount news module that stores news entries in an in-memory repository for the first implementation.

#### Scenario: Backend creates draft
- **WHEN** a backend caller requests creation of a discount news draft
- **THEN** the system stores a new draft in the backend in-memory repository and returns it

#### Scenario: Backend lists drafts
- **WHEN** a backend caller requests discount news entries
- **THEN** the system returns stored news entries sorted by creation time descending

#### Scenario: Backend rejects unknown draft updates
- **WHEN** a backend caller updates selected events for an unknown news entry ID
- **THEN** the system returns a typed not-found error

### Requirement: Candidate discount event extraction
The system SHALL extract eligible discount event candidates for a news draft from backend current discount events.

#### Scenario: Candidates come from current events
- **WHEN** candidates are requested for a draft
- **THEN** the system considers only discount events whose discount window is currently active

#### Scenario: Published event is filtered
- **WHEN** a current discount event ID is already selected by a news entry with status `published`
- **THEN** the event is excluded from candidate results for other drafts

#### Scenario: Same game future event remains eligible
- **WHEN** a game has a previous published discount event and a different current discount event ID
- **THEN** the current discount event remains eligible for candidate results

#### Scenario: Existing draft selection is marked
- **WHEN** a candidate discount event is already selected by the requested draft
- **THEN** the candidate response includes the event with `alreadySelected` set to true unless the event has become unavailable

### Requirement: Candidate ranking
The system SHALL rank discount news candidates deterministically before applying the candidate limit.

#### Scenario: Historic-low type affects ranking
- **WHEN** candidates include `newHistoricLow`, `historicLow`, and `nonHistoricLow` events
- **THEN** `newHistoricLow` candidates rank before `historicLow` candidates, and `historicLow` candidates rank before `nonHistoricLow` candidates when other ranking inputs are equal

#### Scenario: Discount percent affects ranking
- **WHEN** candidates have the same historic-low type
- **THEN** candidates with higher `discountPercent` rank earlier than candidates with lower `discountPercent` when other ranking inputs are equal

#### Scenario: End time affects ranking
- **WHEN** candidates have the same historic-low type and discount percent
- **THEN** candidates ending sooner rank earlier than candidates ending later

#### Scenario: Candidate limit is applied after ranking
- **WHEN** candidates are requested with input `{ limit: 10 }`
- **THEN** the system returns at most ten candidates after filtering and ranking

#### Scenario: Candidate explains ranking
- **WHEN** a candidate is returned
- **THEN** it includes a numeric `score` and a readable `reason` derived from deterministic discount signals

### Requirement: News draft selected event update
The system SHALL allow callers to save selected discount event IDs on an existing draft.

#### Scenario: Save selected events
- **WHEN** a caller updates a draft with selected discount event IDs
- **THEN** the system replaces the draft's `selectedDiscountEventIds` with the submitted event IDs and updates `updatedAt`

#### Scenario: Reject unavailable event selection
- **WHEN** a caller submits a discount event ID that does not exist in backend discount events
- **THEN** the system returns a typed validation error and does not update the draft

#### Scenario: Preserve selection order
- **WHEN** a caller saves selected discount event IDs in a specific order
- **THEN** the draft stores the selected IDs in that submitted order

### Requirement: Backend tRPC workflow for automation
The system SHALL expose discount news draft procedures through the Nest backend tRPC endpoint for external automation callers.

#### Scenario: Automation creates draft through backend
- **WHEN** an external automation caller invokes the backend tRPC create-draft procedure
- **THEN** the backend creates and returns a new discount news draft without requiring frontend interaction

#### Scenario: Automation retrieves candidates through backend
- **WHEN** an external automation caller invokes the backend tRPC candidates procedure with a news entry ID
- **THEN** the backend returns ranked eligible discount event candidates for that draft

#### Scenario: Automation saves selected events through backend
- **WHEN** an external automation caller invokes the backend tRPC update-selected-events procedure
- **THEN** the backend updates the selected discount events on the target draft

### Requirement: Content production news selection workspace
The frontend SHALL provide a content-production workspace where users can create a discount news draft, review candidate discount events, select events, and save the selection.

#### Scenario: User opens news entry workspace
- **WHEN** the user navigates to the discount news entry management workspace
- **THEN** the system displays a workspace for news draft list and selection management instead of placeholder content

#### Scenario: User creates draft
- **WHEN** the user clicks the create draft action
- **THEN** the system creates a backend draft and displays it as the active draft

#### Scenario: User reviews candidates
- **WHEN** a draft is active
- **THEN** the system displays ranked candidate discount events with game identity, discount percent, discounted price, historic-low type, discount period, score, reason, and selection state

#### Scenario: User saves selection
- **WHEN** the user selects candidate discount events and saves the draft
- **THEN** the system updates the backend draft and reflects the saved selected events in the UI

#### Scenario: Content generation is unavailable
- **WHEN** the user is managing discount news entries in this first implementation
- **THEN** the system does not expose title, summary, body generation, or publish-channel controls
