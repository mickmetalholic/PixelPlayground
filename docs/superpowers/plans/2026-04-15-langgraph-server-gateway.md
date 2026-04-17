# LangGraph Server Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an official LangGraph Server subproject and expose stable Nest gateway APIs with PostgreSQL-backed session persistence.

**Architecture:** Keep `apps/langgraph-server` as the official runtime boundary for graph execution and checkpoint persistence, while `apps/backend` only handles HTTP validation, business orchestration, and upstream mapping. The Nest module is split into controller/service/repository/mappers so protocol changes in LangGraph stay isolated in DAL. Session continuity is handled via `sessionId` and idempotent `requestId`.

**Tech Stack:** Turborepo, pnpm workspace, NestJS, official LangGraph Server, PostgreSQL, Jest, Biome

---

## File Structure Lock-in

- Create: `apps/langgraph-server/package.json` (official runtime scripts and deps)
- Create: `apps/langgraph-server/.env.example` (LangGraph + PostgreSQL env template)
- Create: `apps/langgraph-server/README.md` (local runbook and troubleshooting)
- Create: `apps/backend/src/modules/langgraph-gateway/langgraph-gateway.module.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/langgraph-gateway.controller.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/langgraph-gateway.service.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/langgraph-client.repository.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/dto/chat-request.dto.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/dto/chat-response.dto.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/mappers/langgraph-request.mapper.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/mappers/langgraph-response.mapper.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/errors/langgraph-gateway.error.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/__tests__/langgraph-gateway.service.spec.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/__tests__/langgraph-client.repository.spec.ts`
- Create: `apps/backend/test/langgraph-gateway.e2e-spec.ts`
- Modify: `apps/backend/src/app.module.ts` (import gateway module)
- Modify: `apps/backend/src/main.ts` (global validation pipe / timeout-aware config if needed)
- Modify: `apps/backend/package.json` (test/lint scripts include new tests if required)
- Modify: `turbo.json` (ensure new app tasks and outputs are wired)
- Modify: `pnpm-workspace.yaml` (confirm `apps/*` coverage stays valid; only change if needed)
- Modify: `docs/superpowers/specs/2026-04-15-langgraph-server-gateway-design.md` (only if post-implementation clarification is required; otherwise no change)

---

### Task 1: Bootstrap official LangGraph Server app with official scaffolder

**Files:**
- Create: `apps/langgraph-server/package.json`
- Create: `apps/langgraph-server/.env.example`
- Create: `apps/langgraph-server/README.md`
- Modify: `turbo.json`
- Test: `apps/langgraph-server/README.md` commands

- [ ] **Step 1: Write the failing integration smoke test command (manual gate)**

```bash
pnpm --filter @pixel-playground/langgraph-server run dev
```

Expected: FAIL initially because package and scripts do not exist.

- [ ] **Step 2: Run official scaffold command to generate project**

```bash
cd apps
npm create langgraph@latest langgraph-server
```

Expected: interactive scaffold succeeds and creates `apps/langgraph-server` with official files (including `langgraph.json` and `src/*`).

- [ ] **Step 3: Standardize generated package metadata for monorepo**

```json
{
  "name": "@pixel-playground/langgraph-server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "langgraph dev",
    "build": "echo \"No build step for langgraph-server\"",
    "test": "echo \"No tests yet\"",
    "lint": "biome check ."
  },
  "dependencies": {},
  "devDependencies": {}
}
```

Use the generated file as baseline and only patch fields that must align with the workspace (name/scripts/lint compatibility).

- [ ] **Step 4: Add env template and runbook**

```env
# apps/langgraph-server/.env.example
LANGGRAPH_POSTGRES_URL=postgresql://postgres:postgres@127.0.0.1:5432/langgraph
LANGGRAPH_HOST=127.0.0.1
LANGGRAPH_PORT=8123
```

```md
# apps/langgraph-server/README.md
## Local start
1. Copy `.env.example` to `.env`.
2. Ensure PostgreSQL is reachable.
3. Run `pnpm --filter @pixel-playground/langgraph-server dev`.
4. If scaffolded scripts differ, keep official script as source-of-truth and adapt Turbo mapping.
```

- [ ] **Step 5: Wire Turborepo task behavior**

```json
{
  "tasks": {
    "dev": { "persistent": true, "cache": false },
    "build": { "outputs": ["dist/**"] },
    "test": {},
    "lint": {}
  }
}
```

Use scoped override for `@pixel-playground/langgraph-server#build` if needed so no invalid outputs are assumed.

- [ ] **Step 6: Verify smoke run succeeds**

Run: `pnpm --filter @pixel-playground/langgraph-server dev`  
Expected: process starts and listens on configured host/port without missing script errors.

- [ ] **Step 7: Commit**

```bash
git add apps/langgraph-server turbo.json
git commit -m "feat(langgraph): scaffold server with official cli"
```

---

### Task 2: Add Nest gateway module skeleton with strict layering

**Files:**
- Create: `apps/backend/src/modules/langgraph-gateway/langgraph-gateway.module.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/langgraph-gateway.controller.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/langgraph-gateway.service.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/langgraph-client.repository.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/dto/chat-request.dto.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/dto/chat-response.dto.ts`
- Modify: `apps/backend/src/app.module.ts`
- Test: `apps/backend/src/modules/langgraph-gateway/__tests__/langgraph-gateway.service.spec.ts`

- [ ] **Step 1: Write failing service unit test for session routing**

```ts
it("creates a stable sessionId and forwards requestId to repository", async () => {
  const output = await service.chat({ message: "hello" });
  expect(output.sessionId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  );
  expect(repository.invoke).toHaveBeenCalledWith(
    expect.objectContaining({ requestId: expect.any(String) }),
  );
});
```

- [ ] **Step 2: Run test to confirm failure**

Run: `pnpm --filter @pixel-playground/backend test -- langgraph-gateway.service.spec.ts`  
Expected: FAIL because module and service are missing.

- [ ] **Step 3: Implement module/controller/service/repository minimal contracts**

```ts
// langgraph-gateway.controller.ts
@Controller("langgraph")
export class LanggraphGatewayController {
  constructor(private readonly service: LanggraphGatewayService) {}

  @Post("chat")
  chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.service.chat(dto);
  }
}
```

```ts
// langgraph-gateway.service.ts
chat(input: ChatRequestDto): Promise<ChatResponseDto> {
  const sessionId = input.sessionId ?? randomUUID();
  const requestId = randomUUID();
  return this.repository.invoke({ sessionId, requestId, message: input.message });
}
```

- [ ] **Step 4: Import gateway module in app root**

```ts
@Module({
  imports: [LanggraphGatewayModule],
})
export class AppModule {}
```

- [ ] **Step 5: Re-run tests and verify pass**

Run: `pnpm --filter @pixel-playground/backend test -- langgraph-gateway.service.spec.ts`  
Expected: PASS with session and requestId assertions.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/app.module.ts apps/backend/src/modules/langgraph-gateway
git commit -m "feat(backend): add langgraph gateway module skeleton"
```

---

### Task 3: Implement upstream repository, mappers, and error translation

**Files:**
- Create: `apps/backend/src/modules/langgraph-gateway/mappers/langgraph-request.mapper.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/mappers/langgraph-response.mapper.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/errors/langgraph-gateway.error.ts`
- Modify: `apps/backend/src/modules/langgraph-gateway/langgraph-client.repository.ts`
- Test: `apps/backend/src/modules/langgraph-gateway/__tests__/langgraph-client.repository.spec.ts`

- [ ] **Step 1: Write failing repository tests for timeout and status mapping**

```ts
it("throws UpstreamTimeout when fetch aborts", async () => {
  mockFetchAbort();
  await expect(repository.invoke(payload)).rejects.toMatchObject({
    code: "UPSTREAM_TIMEOUT",
  });
});

it("maps 404 to SessionNotFound domain error", async () => {
  mockFetchStatus(404, { message: "thread not found" });
  await expect(repository.invoke(payload)).rejects.toMatchObject({
    code: "SESSION_NOT_FOUND",
  });
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `pnpm --filter @pixel-playground/backend test -- langgraph-client.repository.spec.ts`  
Expected: FAIL because mapping errors are not implemented.

- [ ] **Step 3: Implement request/response mappers and domain error class**

```ts
export class LanggraphGatewayError extends Error {
  constructor(
    public readonly code:
      | "UPSTREAM_TIMEOUT"
      | "SESSION_NOT_FOUND"
      | "UPSTREAM_UNAVAILABLE"
      | "UPSTREAM_BAD_RESPONSE",
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
```

```ts
if (abortSignal.aborted) {
  throw new LanggraphGatewayError("UPSTREAM_TIMEOUT", "Upstream timeout", 504);
}
if (response.status === 404) {
  throw new LanggraphGatewayError("SESSION_NOT_FOUND", "Session not found", 404);
}
```

- [ ] **Step 4: Implement deterministic error JSON in controller**

```ts
if (error instanceof LanggraphGatewayError) {
  throw new HttpException(
    { code: error.code, message: error.message, requestId },
    error.status,
  );
}
```

- [ ] **Step 5: Run focused tests**

Run: `pnpm --filter @pixel-playground/backend test -- langgraph-client.repository.spec.ts langgraph-gateway.service.spec.ts`  
Expected: PASS with timeout/status mapping.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/modules/langgraph-gateway
git commit -m "feat(backend): add langgraph upstream mapping and error model"
```

---

### Task 4: Add session persistence index and idempotency handling

**Files:**
- Modify: `apps/backend/src/modules/langgraph-gateway/langgraph-gateway.service.ts`
- Create: `apps/backend/src/modules/langgraph-gateway/session-index.repository.ts`
- Modify: `apps/backend/src/modules/langgraph-gateway/langgraph-gateway.module.ts`
- Test: `apps/backend/src/modules/langgraph-gateway/__tests__/langgraph-gateway.service.spec.ts`

- [ ] **Step 1: Write failing tests for session resume and request dedup**

```ts
it("reuses thread mapping when same sessionId is provided", async () => {
  sessionIndex.getThreadId.mockResolvedValue("thread-1");
  await service.chat({ sessionId: "session-1", message: "resume" });
  expect(repository.invoke).toHaveBeenCalledWith(
    expect.objectContaining({ threadId: "thread-1" }),
  );
});

it("returns cached result when requestId already processed", async () => {
  sessionIndex.getResponseByRequestId.mockResolvedValue(cachedResponse);
  await expect(service.chat({ sessionId: "s", requestId: "r", message: "x" })).resolves.toEqual(cachedResponse);
});
```

- [ ] **Step 2: Run test and confirm failure**

Run: `pnpm --filter @pixel-playground/backend test -- langgraph-gateway.service.spec.ts`  
Expected: FAIL with missing `session-index.repository`.

- [ ] **Step 3: Implement minimal session index interface (backed by PostgreSQL later)**

```ts
export interface SessionIndexRepository {
  getThreadId(sessionId: string): Promise<string | null>;
  saveThreadId(sessionId: string, threadId: string): Promise<void>;
  getResponseByRequestId(requestId: string): Promise<ChatResponseDto | null>;
  saveResponseByRequestId(requestId: string, response: ChatResponseDto): Promise<void>;
}
```

- [ ] **Step 4: Update service composition**

```ts
const requestId = input.requestId ?? randomUUID();
const cached = await this.sessionIndex.getResponseByRequestId(requestId);
if (cached) return cached;

const threadId = input.sessionId
  ? await this.sessionIndex.getThreadId(input.sessionId)
  : null;
const response = await this.repository.invoke({ ...payload, threadId, requestId });
await this.sessionIndex.saveThreadId(response.sessionId, response.threadId);
await this.sessionIndex.saveResponseByRequestId(requestId, response);
return response;
```

- [ ] **Step 5: Re-run test and verify pass**

Run: `pnpm --filter @pixel-playground/backend test -- langgraph-gateway.service.spec.ts`  
Expected: PASS with resume + idempotency behavior.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/modules/langgraph-gateway
git commit -m "feat(backend): add session index and idempotency flow"
```

---

### Task 5: End-to-end integration and local dev workflow

**Files:**
- Create: `apps/backend/test/langgraph-gateway.e2e-spec.ts`
- Modify: `apps/backend/package.json`
- Modify: `apps/langgraph-server/README.md`
- Test: `apps/backend/test/langgraph-gateway.e2e-spec.ts`

- [ ] **Step 1: Write failing e2e test for gateway contract**

```ts
it("POST /langgraph/chat returns stable payload", async () => {
  const response = await request(app.getHttpServer())
    .post("/langgraph/chat")
    .send({ message: "hello" })
    .expect(200);

  expect(response.body).toMatchObject({
    sessionId: expect.any(String),
    message: expect.any(String),
    requestId: expect.any(String),
  });
});
```

- [ ] **Step 2: Run e2e and confirm failure**

Run: `pnpm --filter @pixel-playground/backend test:e2e -- langgraph-gateway.e2e-spec.ts`  
Expected: FAIL because endpoint wiring/mocks are incomplete.

- [ ] **Step 3: Add e2e module wiring and upstream stub strategy**

```ts
beforeAll(async () => {
  process.env.LANGGRAPH_BASE_URL = "http://127.0.0.1:8123";
  // provide mocked repository or test double to isolate gateway contract
});
```

- [ ] **Step 4: Document two-process local run**

```md
## Start both services
1. `pnpm --filter @pixel-playground/langgraph-server dev`
2. `pnpm --filter @pixel-playground/backend dev`
3. `curl -X POST http://127.0.0.1:3000/langgraph/chat -H "content-type: application/json" -d "{\"message\":\"hello\"}"`
```

- [ ] **Step 5: Run full backend verification**

Run: `pnpm --filter @pixel-playground/backend lint && pnpm --filter @pixel-playground/backend test && pnpm --filter @pixel-playground/backend test:e2e`  
Expected: all PASS, no lint errors in gateway files.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/test apps/backend/package.json apps/langgraph-server/README.md
git commit -m "test(backend): add langgraph gateway e2e coverage"
```

---

### Task 6: Monorepo verification and integration finish

**Files:**
- Modify: `turbo.json` (if task filters/outputs still need alignment)
- Modify: `docs/superpowers/plans/2026-04-15-langgraph-server-gateway.md` (checkbox updates only during execution)
- Test: workspace-level verification commands

- [ ] **Step 1: Run workspace lint**

Run: `pnpm lint`  
Expected: PASS across root + `apps/backend` + `apps/langgraph-server`.

- [ ] **Step 2: Run workspace tests**

Run: `pnpm turbo run test`  
Expected: PASS for backend tests; langgraph-server test script exits cleanly.

- [ ] **Step 3: Run workspace build**

Run: `pnpm turbo run build`  
Expected: PASS with valid outputs configuration and no broken tasks.

- [ ] **Step 4: Run manual persistence check**

Run:
```bash
curl -X POST http://127.0.0.1:3000/langgraph/chat -H "content-type: application/json" -d "{\"message\":\"first\"}"
# restart backend and langgraph-server processes
curl -X POST http://127.0.0.1:3000/langgraph/chat -H "content-type: application/json" -d "{\"sessionId\":\"<same-session-id>\",\"message\":\"resume\"}"
```
Expected: second response continues prior context using same session.

- [ ] **Step 5: Commit final integration adjustments**

```bash
git add turbo.json
git commit -m "chore(monorepo): align langgraph gateway workspace tasks"
```

---

## Spec Coverage Self-Review

- **Architecture boundary:** Covered in Task 1 and Task 2 (separate app + thin Nest layering).
- **Session persistence first:** Covered in Task 4 and Task 6 (session index + restart resume check).
- **Error mapping and stability:** Covered in Task 3.
- **Testing and acceptance criteria:** Covered in Task 5 and Task 6.
- **No auth for internal use:** Kept by design (no auth middleware introduced in any task).
- **PostgreSQL priority:** Reflected in env and persistence assumptions (Task 1/Task 4); concrete migration DDL can be added inside Task 4 implementation if project chooses Prisma/SQL tooling.

## Placeholder Scan

- No `TODO`/`TBD` placeholders remain.
- All code-changing steps include explicit snippets.
- All run steps include commands and expected outcomes.

## Type and Naming Consistency Check

- `sessionId`, `threadId`, `requestId` naming is consistent across controller/service/repository/tests.
- Domain error codes are centralized under `LanggraphGatewayError`.
- File names match module responsibilities without layer leakage.

---

## Notes on docs dependency

- Context7 `langgraphjs` docs were used to ground Task 1 scaffolding:
  - `npm create langgraph` (official project init)
  - optional global flow: `npm install -g create-langgraph` then `create-langgraph <path>`
  - local CLI availability: `npx @langchain/langgraph-cli@latest`
- Before implementing Task 3, re-check official docs for exact persistence config keys and upstream API route details, because these can change across LangGraph releases.

