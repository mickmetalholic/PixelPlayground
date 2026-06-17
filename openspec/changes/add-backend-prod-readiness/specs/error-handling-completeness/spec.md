## MODIFIED Requirements

### Requirement: SteamMetadataController list endpoint has error handling
The `GET /steam/games` (list) endpoint in the backend SHALL return structured JSON error responses for all error cases via the global exception filter, without requiring a controller-level try/catch for error normalization.

#### Scenario: Service error during list returns structured JSON
- **WHEN** `SteamMetadataService.getGames()` throws a known domain error
- **THEN** the global exception filter maps it to an appropriate HTTP 4xx/5xx JSON response with `statusCode`, `code`, `message`, and `timestamp` fields

#### Scenario: Unexpected error during list returns 500 JSON
- **WHEN** `SteamMetadataService.getGames()` throws an unexpected error not caught by the controller
- **THEN** the global exception filter returns HTTP 500 with `code: "INTERNAL_SERVER_ERROR"` and a structured JSON body
