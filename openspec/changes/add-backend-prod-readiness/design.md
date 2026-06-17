## Context

The NestJS backend (`apps/backend`) serves as the API gateway: it hosts tRPC routes for the frontend, proxies to the LangGraph server, and provides Steam metadata endpoints. Currently `main.ts` is a bare `NestFactory.create` + `app.listen` with no global pipes, filters, or middleware. Two REST controllers (`LanggraphGatewayController`, `SteamMetadataController`) implement error handling manually with per-endpoint try/catch blocks. DTOs like `ChatRequestDto` are plain classes with no runtime validation — the `@Body()` decorator accepts any shape.

The project uses Zod extensively (env validation in `main.ts`, tRPC input schemas in `packages/api`), so a Zod-based solution avoids introducing a second validation library.

## Goals / Non-Goals

**Goals:**
- Runtime DTO validation on every `@Body()` decorated parameter where the DTO defines a `static zodSchema`
- Consistent JSON error response shape for all exceptions (validation errors, domain errors, unexpected errors)
- Per-request logging with method, path, status code, and duration
- Zero new npm dependencies
- Minimal changes to existing controller code

**Non-Goals:**
- Replacing tRPC-level validation (tRPC already validates inputs via Zod schemas in router definitions)
- Structured/JSON log output for production log aggregation (foundation laid, but not wired up)
- Rate limiting, CORS hardening, or other production concerns beyond the three stated items
- Modifying exception-to-HTTP mapping logic in individual controllers (controllers may keep existing try/catch for domain-specific mapping; the filter is a safety net)

## Decisions

### Decision 1: Zod schema attached as `static` property on DTO classes

**Chosen**: DTOs expose `static zodSchema: z.ZodObject`. The global pipe checks `metatype?.zodSchema` and calls `.parse(value)` if present. No decorators, no `class-validator`/`class-transformer` dependencies.

**Alternatives considered**:
- `class-validator` + `class-transformer` + built-in `ValidationPipe`: the NestJS standard, but introduces two new dependencies (`class-validator`, `class-transformer`) and a second validation paradigm alongside existing Zod usage.
- `@anatine/zod-nestjs` or `nestjs-zod` libraries: community packages that bridge Zod pipes into NestJS. They work but add an external dependency for ~20 lines of code we can write ourselves.
- Decorator-based Zod (`@ZodSchema()`): more NestJS-idiomatic but requires `emitDecoratorMetadata` and a custom decorator factory. The static property approach is simpler and equally discoverable.

**Rationale**: Zod is already a direct dependency of the backend. A static property is trivially testable and requires no decorator metadata. DTOs without a schema (or non-DTO parameters like `@Param('id')`) pass through unchanged.

### Decision 2: Single global exception filter with layered type dispatch

**Chosen**: One `GlobalExceptionFilter` implementing `ExceptionFilter` that handles three categories:

| Exception type | HTTP status | `code` field | Additional |
|---|---|---|---|
| `ZodError` | 400 | `VALIDATION_ERROR` | `errors: z.ZodIssue[]` |
| `HttpException` | (preserved) | (preserved from body, or `HTTP_ERROR`) | — |
| Unknown | 500 | `INTERNAL_SERVER_ERROR` | message sanitized |

The response shape for all errors is `{ statusCode, code, message, timestamp }` plus optional `errors`.

**Alternatives considered**:
- Per-controller `@UseFilters()`: duplicates configuration, easy to forget on new controllers.
- NestJS built-in `BaseExceptionFilter`: can be extended but doesn't handle ZodError or enforce a consistent JSON shape.
- Multiple filters stacked: adds complexity without benefit — a single filter with type dispatch is simpler.

**Rationale**: This gives every endpoint a consistent error shape by default. Controllers can still throw `HttpException` with domain-specific `code` values (e.g., `STEAM_GAME_NOT_FOUND`), and the filter normalizes the envelope without interfering with domain semantics.

### Decision 3: Functional middleware for request logging

**Chosen**: A functional NestJS middleware (not class-based) that uses `Logger` from `@nestjs/common`. Logs `[Nest] <METHOD> <path> <statusCode> <duration>ms` on response finish.

**Alternatives considered**:
- `morgan` middleware: well-known but adds a dependency and its own log format. Doesn't integrate with NestJS `Logger`.
- NestJS interceptor: could observe both request and response, but middleware is the conventional layer for request logging and fires earlier in the lifecycle.
- Structured logging with `pino`/`winston`: overkill for current needs. The middleware uses NestJS `Logger` which can be replaced with a custom implementation later without changing the middleware interface.

**Rationale**: Simple, zero-dependency, uses NestJS's native logger (which respects log levels and can be customized per environment).

### Decision 4: `common/` directory at `apps/backend/src/common/`

**Chosen**: New directory `apps/backend/src/common/` with subdirectories `pipes/`, `filters/`, `middleware/`.

**Alternatives considered**:
- Colocate in each module: appropriate for module-specific infrastructure, but these are global concerns — colocation would hide the global nature.
- `infrastructure/` or `core/` directory names: both are fine; `common/` matches common NestJS convention (e.g., `@nestjs/common`).

### Decision 5: Controller DTO imports must drop `type` keyword

**Chosen**: Change `import type { ChatRequestDto }` to `import { ChatRequestDto }` in controller files.

TypeScript's `type` imports are erased at compile time. NestJS needs the DTO class to exist at runtime so the pipe can access `metatype?.zodSchema`. Without this change, `metatype` is `undefined` and validation is silently skipped.

**Breaking**: No. The DTO is already imported as a value in the same file's `@Body() dto: ChatRequestDto` parameter decorator — TypeScript allows this even with `import type` because the type is used in a type position. But at runtime NestJS reflection needs the actual class reference.

## Risks / Trade-offs

- **[Risk] Silent pass-through for DTOs without `zodSchema`**: If a developer forgets to add `static zodSchema` to a new DTO, validation is skipped with no warning. → **Mitigation**: A future enhancement could log a warning in dev mode when a DTO has no schema. Not in scope for this change.
- **[Risk] `ZodError` message verbosity**: `ZodError.message` is a formatted multi-line string. In production error responses this could be noisy. → **Mitigation**: The `errors` field carries structured `ZodIssue[]`; consumers should read that for programmatic use. The `message` field is kept for human readability.
- **[Trade-off] Global filter removes custom error shapes per endpoint**: Controllers that want a different error shape for specific errors must either catch before the filter (try/catch) or throw `HttpException` with the desired body (the filter preserves `HttpException` body fields). → Acceptable: the filter preserves existing `code`/`message` patterns already in use.
