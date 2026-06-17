## ADDED Requirements

### Requirement: SteamMetadataController list endpoint has error handling
The `GET /steam-metadata` (list) endpoint in the backend SHALL catch and handle service-layer errors consistently with the other endpoints (`detail`, `collect`) in the same controller. Errors MUST map to appropriate HTTP status codes.

#### Scenario: Service error during list is handled
- **WHEN** `SteamMetadataService.list()` throws a known domain error (e.g., `SteamMetadataCollectionNotFoundError`)
- **THEN** the controller returns an appropriate HTTP 4xx/5xx response with a structured error body

#### Scenario: Unexpected error during list is handled
- **WHEN** `SteamMetadataService.list()` throws an unexpected error
- **THEN** the controller returns HTTP 500 with a structured error body (not an uncaught exception)
