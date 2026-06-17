## ADDED Requirements

### Requirement: Backend validates environment variables at startup
The backend application SHALL validate required environment variables using a Zod v4 schema at startup, before the HTTP server starts listening. If validation fails, the application MUST exit with a descriptive error message.

#### Scenario: Valid environment passes validation
- **WHEN** all required environment variables are set with valid values
- **THEN** the application starts normally

#### Scenario: Missing required variable prevents startup
- **WHEN** a required environment variable is missing
- **THEN** the application exits with an error message naming the missing variable

#### Scenario: Invalid value prevents startup
- **WHEN** a required environment variable has an invalid format
- **THEN** the application exits with an error message describing the validation failure

### Requirement: Frontend validates environment variables at build time
The frontend application SHALL validate required environment variables using a Zod v4 schema at build time. If a required variable is missing and has no default, the build MUST fail.

#### Scenario: Valid environment allows build
- **WHEN** all required environment variables are set with valid values
- **THEN** `next build` succeeds

#### Scenario: Missing variable with no default fails build
- **WHEN** a required environment variable with no default is missing
- **THEN** `next build` or dev startup fails with a descriptive message

### Requirement: LangGraph server env example uses safe defaults
The `apps/langgraph-server/.env.example` file SHALL use placeholder values (e.g., `<YOUR_PASSWORD>`) instead of hardcoded default credentials.

#### Scenario: No hardcoded password in env example
- **WHEN** `apps/langgraph-server/.env.example` is read
- **THEN** the `LANGGRAPH_POSTGRES_URL` value contains `<YOUR_PASSWORD>` or similar placeholder instead of a literal password
