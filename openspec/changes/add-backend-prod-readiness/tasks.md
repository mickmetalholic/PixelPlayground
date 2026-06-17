## 1. Setup

- [ ] 1.1 Create `apps/backend/src/common/` directory tree with `pipes/`, `filters/`, `middleware/` subdirectories

## 2. Global Zod Validation Pipe

- [ ] 2.1 Implement `GlobalZodValidationPipe` in `apps/backend/src/common/pipes/global-zod-validation.pipe.ts` — checks `metatype?.zodSchema`, calls `.parse(value)` if present, passes through otherwise
- [ ] 2.2 Write unit test `global-zod-validation.pipe.spec.ts` covering: DTO with valid data, DTO with invalid data (expect ZodError), parameter without DTO metatype (pass through), DTO without zodSchema (pass through)

## 3. Global Exception Filter

- [ ] 3.1 Implement `GlobalExceptionFilter` in `apps/backend/src/common/filters/global-exception.filter.ts` — ZodError → 400, HttpException → preserve status + body fields, unknown → 500, all with `{ statusCode, code, message, timestamp }` envelope
- [ ] 3.2 Write unit test `global-exception.filter.spec.ts` covering: ZodError produces 400 with errors array, HttpException preserves custom code/fields, generic Error produces 500 with INTERNAL_SERVER_ERROR

## 4. Request Logger Middleware

- [ ] 4.1 Implement `RequestLoggerMiddleware` in `apps/backend/src/common/middleware/request-logger.middleware.ts` — logs method, path, status code, and duration via NestJS Logger on response finish
- [ ] 4.2 Write unit test `request-logger-middleware.spec.ts` covering: successful request logs 200 + duration, failed request logs error status, log context is "RequestLogger"

## 5. DTO Updates

- [ ] 5.1 Add `static zodSchema` to `ChatRequestDto` in `apps/backend/src/modules/langgraph-gateway/dto/chat-request.dto.ts`
- [ ] 5.2 Change `import type { ChatRequestDto }` to value import `import { ChatRequestDto }` in `langgraph-gateway.controller.ts`
- [ ] 5.3 Verify no other DTO files need a `static zodSchema` (Steam metadata controller uses `@Query()`/`@Param()` without DTO classes)

## 6. Wire into main.ts

- [ ] 6.1 Register `GlobalZodValidationPipe` via `app.useGlobalPipes()`
- [ ] 6.2 Register `GlobalExceptionFilter` via `app.useGlobalFilters()`
- [ ] 6.3 Register `RequestLoggerMiddleware` via consumer in `AppModule` (or `app.use()` in `main.ts`)
- [ ] 6.4 Remove redundant per-controller try/catch blocks where the global filter now provides the safety net (optional — existing catches are still valid)

## 7. Verification

- [ ] 7.1 Run `pnpm lint` from repo root — no new violations
- [ ] 7.2 Run `pnpm --filter @pixel-playground/backend test` — all existing tests pass
- [ ] 7.3 Run `pnpm --filter @pixel-playground/backend test:cov` — confirm new pipe/filter/middleware tests contribute to coverage
- [ ] 7.4 Run `pnpm build` from repo root — backend builds without errors
