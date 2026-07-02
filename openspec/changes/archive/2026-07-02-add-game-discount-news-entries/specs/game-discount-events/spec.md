## ADDED Requirements

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
