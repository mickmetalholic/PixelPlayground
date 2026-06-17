## ADDED Requirements

### Requirement: DTOs with Zod schema are validated at runtime
The backend SHALL validate request bodies against a `static zodSchema` property when present on the DTO class used as a `@Body()` parameter.

#### Scenario: Valid request body passes validation
- **WHEN** a client sends a POST request with a body that conforms to the DTO's `zodSchema`
- **THEN** the request proceeds to the controller handler with the parsed DTO as the parameter value

#### Scenario: Invalid request body fails with 400
- **WHEN** a client sends a POST request with a body that violates the DTO's `zodSchema` (e.g., missing required field, wrong type)
- **THEN** the server responds with HTTP 400 and a `VALIDATION_ERROR` structured error body containing the Zod issues

### Requirement: Parameters without a DTO schema pass through unchanged
Requests without a DTO class, or DTO classes without a `static zodSchema`, SHALL pass through the global validation pipe without modification.

#### Scenario: Query parameter passes through
- **WHEN** a client sends a GET request with query parameters (no `@Body()` DTO with schema)
- **THEN** the request proceeds normally without validation interference

#### Scenario: DTO without schema passes through
- **WHEN** a DTO class is used as a `@Body()` parameter but has no `static zodSchema` property
- **THEN** the request proceeds normally without validation and the raw body is passed to the controller
