## ADDED Requirements

### Requirement: Backend SHALL expose a tRPC panel endpoint
The backend SHALL expose an HTTP endpoint at `/trpc-panel` that returns a rendered `trpc-panel` HTML page for the current backend tRPC router.

#### Scenario: Serve panel page successfully
- **WHEN** a client sends `GET /trpc-panel` and panel feature is enabled
- **THEN** the backend MUST respond with status `200`
- **AND** the response `Content-Type` MUST include `text/html`
- **AND** the page MUST be rendered from the backend tRPC router definition

### Requirement: Panel availability MUST be environment-gated
The backend MUST disable the panel by default when `NODE_ENV` is `production`, and MUST allow explicit override by `TRPC_PANEL_ENABLED`.

#### Scenario: Production default is disabled
- **WHEN** `NODE_ENV=production` and `TRPC_PANEL_ENABLED` is not set
- **THEN** `GET /trpc-panel` MUST return `404`

#### Scenario: Explicit override enables panel in production
- **WHEN** `NODE_ENV=production` and `TRPC_PANEL_ENABLED=true`
- **THEN** `GET /trpc-panel` MUST return `200` with HTML response

#### Scenario: Explicit override disables panel in non-production
- **WHEN** `NODE_ENV=development` and `TRPC_PANEL_ENABLED=false`
- **THEN** `GET /trpc-panel` MUST return `404`

### Requirement: Panel target URL MUST follow deterministic resolution
The backend MUST resolve the panel request URL using `TRPC_PANEL_TRPC_URL` when provided; otherwise it MUST derive `${origin}/trpc` from the incoming HTTP request origin.

#### Scenario: Use explicit tRPC URL override
- **WHEN** `TRPC_PANEL_TRPC_URL` is set to an absolute URL
- **THEN** rendered panel configuration MUST target that URL for procedure calls

#### Scenario: Fallback to request-origin-based URL
- **WHEN** `TRPC_PANEL_TRPC_URL` is not set
- **THEN** rendered panel configuration MUST target `${requestOrigin}/trpc`

### Requirement: Panel renderer MUST use superjson transformer
The backend MUST render `trpc-panel` with transformer set to `superjson` to match backend serialization conventions.

#### Scenario: Render with superjson transformer
- **WHEN** panel HTML is generated
- **THEN** panel configuration MUST include `transformer: "superjson"`
