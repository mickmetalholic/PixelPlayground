## 1. Dependency and Module Setup

- [x] 1.1 Add `trpc-panel` to `apps/backend/package.json` dependencies and install workspace lockfile updates.
- [x] 1.2 Create `apps/backend/src/modules/trpc-panel/trpc-panel.module.ts` with focused controller/service wiring.
- [x] 1.3 Import `TrpcPanelModule` in `apps/backend/src/app.module.ts` without changing existing `TrpcModule` behavior.

## 2. Configuration and Service Implementation

- [x] 2.1 Create `apps/backend/src/modules/trpc-panel/trpc-panel.config.ts` to parse `TRPC_PANEL_ENABLED` and `TRPC_PANEL_TRPC_URL` with production-safe defaults.
- [x] 2.2 Create `apps/backend/src/modules/trpc-panel/trpc-panel.service.ts` to resolve target URL and render panel HTML with `transformer: "superjson"`.
- [x] 2.3 Ensure disabled mode throws `NotFoundException` so `/trpc-panel` returns `404` when feature is off.

## 3. HTTP Endpoint Delivery

- [x] 3.1 Create `apps/backend/src/modules/trpc-panel/trpc-panel.controller.ts` exposing `GET /trpc-panel`.
- [x] 3.2 Keep controller thin: derive request origin and delegate rendering to service only.
- [x] 3.3 Set response content type to `text/html` and return rendered panel markup.

## 4. Automated Test Coverage

- [x] 4.1 Add unit tests in `apps/backend/src/modules/trpc-panel/__tests__/trpc-panel.config.spec.ts` for default and override behavior.
- [x] 4.2 Add unit tests in `apps/backend/src/modules/trpc-panel/__tests__/trpc-panel.service.spec.ts` for URL resolution, disabled mode, and transformer configuration.
- [x] 4.3 Extend `apps/backend/test/app.e2e-spec.ts` with `/trpc-panel` success scenario (enabled mode).
- [x] 4.4 Add `/trpc-panel` disabled scenario in e2e using environment override (`TRPC_PANEL_ENABLED=false`).

## 5. Documentation and Verification

- [x] 5.1 Update `apps/backend/README.md` with `/trpc-panel` usage and environment variables.
- [x] 5.2 Run backend test suite to verify unit and e2e scenarios pass (`pnpm --filter @pixel-playground/backend test`).
- [x] 5.3 Run repository lint/format checks required by hooks and CI (`pnpm lint`).
