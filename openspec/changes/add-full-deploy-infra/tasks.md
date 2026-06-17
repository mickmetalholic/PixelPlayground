## 1. `.dockerignore` files

- [ ] 1.1 Expand `apps/langgraph-server/.dockerignore` — add `.turbo/`, `tests/`, `scripts/`, `jest.config.js`, `tsconfig.json`, `.env`, `.env.example`, `*.md`, `.gitignore`; retain existing `node_modules` and `dist` entries
- [ ] 1.2 Create `apps/backend/.dockerignore` — `node_modules`, `dist`, `.turbo`, `*.md`, `.gitignore`, `vitest.workspace.ts`, `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `.env`, `.env.example`
- [ ] 1.3 Create `apps/frontend/.dockerignore` — `node_modules`, `.next`, `.turbo`, `*.md`, `.gitignore`, `vitest.config.ts`, `vitest.setup.ts`, `tsconfig.json`, `tsconfig.tsbuildinfo`, `postcss.config.mjs`, `components.json`, `.env`, `.env.example`

## 2. Next.js standalone mode

- [ ] 2.1 Add `output: "standalone"` to `apps/frontend/next.config.ts`

## 3. Dockerfiles

- [ ] 3.1 Create `apps/backend/Dockerfile` — multi-stage: deps install (workspace root + packages/api + apps/backend) → `nest build` → production image with only `dist/`, production `node_modules`, and `package.json`; entrypoint `node dist/main.js`; expose port 3000
- [ ] 3.2 Create `apps/frontend/Dockerfile` — multi-stage: deps install (workspace root + packages/api + apps/frontend) → `next build` → production image from `.next/standalone/` + `.next/static/` + `public/`; entrypoint `node server.js`; expose port 7000

## 4. k8s manifests

- [ ] 4.1 Create `k8s/configmap.yaml` — `pixel-playground-config` ConfigMap with all non-sensitive env vars: service host/port refs, `POSTGRES_DB`, `POSTGRES_HOST`, `DATABASE_URL` (composed)
- [ ] 4.2 Create `k8s/secret.yaml` — `pixel-playground-secret` Secret with placeholder values for `POSTGRES_USER`, `POSTGRES_PASSWORD`, base64 encoding setup comments
- [ ] 4.3 Create `k8s/langgraph-postgres/statefulset.yaml` — StatefulSet, 1 replica, `postgres:17-alpine`, env from ConfigMap + Secret, port 5432
- [ ] 4.4 Create `k8s/langgraph-postgres/service.yaml` — ClusterIP Service for `langgraph-postgres:5432`
- [ ] 4.5 Create `k8s/langgraph-postgres/pvc.yaml` — PersistentVolumeClaim, 1Gi+, default StorageClass
- [ ] 4.6 Create `k8s/langgraph-server/deployment.yaml` — Deployment, 1 replica, image `ghcr.io/mickmetalholic/pixelplayground/langgraph-server:latest`, port 8123, liveness + readiness probes, env from ConfigMap + Secret
- [ ] 4.7 Create `k8s/langgraph-server/service.yaml` — ClusterIP Service for `langgraph-server:8123`
- [ ] 4.8 Create `k8s/backend/deployment.yaml` — Deployment, 1 replica, image `ghcr.io/mickmetalholic/pixelplayground/backend:latest`, port 3000, liveness + readiness probes, env from ConfigMap
- [ ] 4.9 Create `k8s/backend/service.yaml` — ClusterIP Service for `backend:3000`
- [ ] 4.10 Create `k8s/frontend/deployment.yaml` — Deployment, 1 replica, image `ghcr.io/mickmetalholic/pixelplayground/frontend:latest`, port 7000, liveness + readiness probes, env from ConfigMap
- [ ] 4.11 Create `k8s/frontend/service.yaml` — ClusterIP Service for `frontend:7000`

## 5. CI Docker build job

- [ ] 5.1 Add a new `docker` job to `.github/workflows/ci.yml` — triggers on `push` to `main`, depends on `quality` passing, uses `ubuntu-latest`, timeout 20 minutes
- [ ] 5.2 Add setup steps: checkout, setup pnpm, setup Node 24.15.0, install dependencies (`pnpm install --frozen-lockfile`)
- [ ] 5.3 Add parallel build steps: `langgraph build` for langgraph-server, `docker build -f apps/backend/Dockerfile` for backend, `docker build -f apps/frontend/Dockerfile` for frontend
- [ ] 5.4 Add Docker login to GHCR via `docker/login-action` with `GITHUB_TOKEN`
- [ ] 5.5 Add push step: tag and push each image with `sha-<short-hash>` and `latest` tags

## 6. Verification

- [ ] 6.1 Run `pnpm lint` from repo root — no new violations
- [ ] 6.2 Run `pnpm build` from repo root — all three apps compile without errors
- [ ] 6.3 Run `pnpm test` from repo root — all existing tests pass
- [ ] 6.4 Run `docker build -f apps/backend/Dockerfile .` — backend image builds successfully
- [ ] 6.5 Run `docker build -f apps/frontend/Dockerfile .` — frontend image builds successfully (with `output: "standalone"` in next.config.ts)
- [ ] 6.6 Run `langgraph build` via `pnpm --filter @pixel-playground/langgraph-server exec langgraphjs build` — langgraph-server image builds successfully
- [ ] 6.7 Validate k8s YAML: `kubectl apply --dry-run=client -f k8s/ --recursive` — all manifests pass schema validation

> **Note**: The cluster-level GitOps configuration (namespace, ArgoCD Application CR) is implemented separately in the CthuTool repo under `openspec/changes/add-homelab-gitops/`. See that change for the `gitops/namespaces/`, `gitops/apps/pixel-playground/`, and `gitops/bootstrap/` tasks.
