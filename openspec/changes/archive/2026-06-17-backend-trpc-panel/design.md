## Context

The backend already exposes tRPC procedures through `/trpc` via `TrpcModule` and shared `appRouter`. Developers currently validate procedures with direct endpoint calls, which is slow and inconsistent for nested routers and typed inputs. The change introduces a backend-native debugging panel using `trpc-panel` while preserving current runtime behavior and keeping production-safe defaults.

Constraints:

- Keep strict layering and small focused modules in NestJS backend.
- Keep existing `TrpcModule` and procedure implementations unchanged.
- Ensure panel availability is environment-controlled and testable.

## Goals / Non-Goals

**Goals:**

- Provide `GET /trpc-panel` endpoint that serves rendered panel HTML.
- Enforce production-safe default by disabling panel when `NODE_ENV=production` unless explicitly overridden.
- Keep behavior deterministic via explicit config parsing and URL resolution rules.
- Add test coverage for enabled/disabled states and URL selection.

**Non-Goals:**

- Adding authentication/authorization in this iteration.
- Building a separate standalone debug frontend.
- Refactoring existing tRPC router contracts.

## Decisions

1. **Create a dedicated `trpc-panel` backend module with controller/service/config boundaries.**  
   - Rationale: keeps HTTP concerns, business orchestration, and env parsing separate and unit-testable.  
   - Alternative considered: add route logic directly inside existing `TrpcModule`; rejected because it mixes middleware routing and panel rendering responsibilities.

2. **Use `trpc-panel` render API with explicit `transformer: "superjson"`.**  
   - Rationale: aligns with current backend serialization behavior and avoids debugging mismatches.  
   - Alternative considered: omit transformer setting and rely on defaults; rejected due to potential serializer drift.

3. **Resolve panel target URL with priority: `TRPC_PANEL_TRPC_URL` override, else `${requestOrigin}/trpc`.**  
   - Rationale: supports reverse-proxy and remote-debug environments while keeping local usage zero-config.  
   - Alternative considered: always derive from request host; rejected because proxy/public URL cases can break calls.

4. **Return `404` when panel is disabled.**  
   - Rationale: reduces debug-surface discovery and keeps disabled state opaque.  
   - Alternative considered: return `403`; rejected because it confirms endpoint existence.

## Risks / Trade-offs

- **[Risk] Debug surface accidentally exposed in production** -> Mitigation: default disabled in production and explicit flag checks.
- **[Risk] Incorrect URL resolution behind proxies** -> Mitigation: explicit `TRPC_PANEL_TRPC_URL` override takes precedence.
- **[Trade-off] No auth in first iteration** -> Mitigation: scope kept minimal; future iteration can wrap endpoint with guard without changing module boundaries.
