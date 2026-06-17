## ADDED Requirements

### Requirement: All exceptions produce structured JSON error responses
The backend SHALL return every error as a JSON response with the shape `{ statusCode, code, message, timestamp }`.

#### Scenario: ZodError returns 400 with validation error details
- **WHEN** a Zod validation error is thrown (e.g., from the global validation pipe)
- **THEN** the server responds with HTTP 400 and a JSON body containing `statusCode: 400`, `code: "VALIDATION_ERROR"`, and an `errors` array with Zod issue details

#### Scenario: HttpException preserves domain error code
- **WHEN** a controller throws `new HttpException({ code: 'STEAM_GAME_NOT_FOUND', message: '...' }, 404)`
- **THEN** the server responds with HTTP 404 and a JSON body containing `code: "STEAM_GAME_NOT_FOUND"`, `message`, `statusCode: 404`, and a `timestamp`

#### Scenario: Unknown exception returns 500
- **WHEN** an unexpected error is thrown (not ZodError, not HttpException)
- **THEN** the server responds with HTTP 500 and a JSON body containing `statusCode: 500`, `code: "INTERNAL_SERVER_ERROR"`, and a generic error message

### Requirement: HttpException response body fields are preserved in the error envelope
When a controller throws an `HttpException` with a custom response body object, the global filter SHALL merge those fields into the standard error response envelope.

#### Scenario: Custom HttpException body fields are preserved
- **WHEN** a controller throws `new HttpException({ code: 'UPSTREAM_TIMEOUT', message: '...', retryAfter: 30 }, 504)`
- **THEN** the response JSON contains `code: "UPSTREAM_TIMEOUT"`, `retryAfter: 30`, plus the standard `statusCode` and `timestamp` fields
