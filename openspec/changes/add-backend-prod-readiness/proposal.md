## Why

The NestJS backend currently lacks production-hardening infrastructure: DTO validation is non-functional (DTOs carry no runtime metadata), error responses rely on per-controller try/catch with no safety net for uncaught exceptions, and there is zero request observability. These gaps mean invalid payloads reach service logic, unhandled errors return ugly HTML 500s instead of structured JSON, and the server has no audit trail for debugging.

## What Changes

- Add a global Zod-based validation pipe that inspects DTOs for a `static zodSchema` and validates request bodies at runtime — zero new dependencies
- Add a global exception filter that normalizes all errors into a consistent JSON shape (`{ statusCode, code, message, timestamp }`) — Zod errors to 400, known HttpExceptions passed through, unknown errors to 500
- Add a request logger middleware that logs method, path, status code, and response time for every request
- Wire all three into `main.ts` via NestJS lifecycle hooks (`app.useGlobalPipes`, `app.useGlobalFilters`, middleware via `app.use`)
- Fix `type`-only DTO imports in controllers to value imports so NestJS DI can reflect on the metatype at runtime

## Capabilities

### New Capabilities

- `global-zod-validation`: Runtime DTO validation using Zod schemas attached to DTO classes, enforced by a global NestJS pipe
- `global-exception-filter`: Uniform JSON error responses for all exception types (Zod, HttpException, unknown) across all controllers
- `request-logging-middleware`: Per-request logging with method, path, status code, and response duration

### Modified Capabilities

- `error-handling-completeness`: The per-controller error handling described in this spec becomes subsumed by the global exception filter — controllers no longer need individual try/catch for error normalization

## Impact

- **Code**: `apps/backend/src/main.ts` (wiring), new `apps/backend/src/common/` directory (pipe, filter, middleware), DTO classes (adding `static zodSchema`), controller imports (removing `type` keyword on DTOs)
- **Dependencies**: None added — Zod is already in the backend's `dependencies`
- **Breaking**: None — all existing endpoints continue to work; error response shape gains `statusCode` and `timestamp` fields but retains the existing `code`/`message` structure
