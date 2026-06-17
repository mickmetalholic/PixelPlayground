## Why

The repository currently has zero deployable artifacts. `apps/langgraph-server/` has a 2-line `.dockerignore` but no Dockerfile, no k8s manifests, and no CI Docker build steps. The other two apps (`frontend`, `backend`) have none of these files at all. The entire monorepo's services cannot be deployed to any environment.

This change adds the Docker and k8s deployment infrastructure for all three services on the PixelPlayground side. The cluster-level GitOps configuration (namespace, ArgoCD Application CRs) lives in the CthuTool repository under `gitops/` — CthuTool serves as the homelab management hub.

## What Changes

**PixelPlayground (this repo):**

- **Add `.dockerignore` files** for all three apps (langgraph-server expanded from 2 lines; backend + frontend newly created)
- **Add `output: "standalone"`** to Next.js config for optimized Docker builds
- **Hand-write Dockerfiles** for backend (NestJS) and frontend (Next.js standalone); langgraph-server uses `langgraph build` (CLI auto-generation)
- **Create `k8s/` directory** at repo root with per-app subdirectories: Deployment + Service for each of the 3 apps, StatefulSet + Service + PVC for the langgraph-dedicated PostgreSQL, plus shared ConfigMap and Secret. These manifests are consumed by ArgoCD from CthuTool's `gitops/` directory.
- **Add CI `docker` job** — builds Docker images for all three apps on `main` push, pushes to GHCR with `sha-<hash>` and `latest` tags

**CthuTool repo (separate change, `gitops/` directory):**

- **Namespace** for `pixel-playground`
- **ArgoCD Application CR** pointing to `k8s/` in this repo for auto-sync
- **Bootstrap directory** scaffold for future ArgoCD installation manifests

## Capabilities

### New Capabilities

- `dockerignore-optimization`: Comprehensive `.dockerignore` files for all three apps, excluding build artifacts, test files, dev scripts, and documentation from Docker build contexts
- `k8s-manifests`: Application-level Kubernetes manifests for the full service topology — frontend, backend, langgraph-server, and langgraph-postgres — consumed by ArgoCD from CthuTool's `gitops/` directory
- `ci-docker-build`: CI workflow step that builds and pushes Docker images for all three apps

## Impact

- **Code**:
  - `apps/langgraph-server/.dockerignore` (expand)
  - `apps/backend/Dockerfile` (new), `apps/backend/.dockerignore` (new)
  - `apps/frontend/Dockerfile` (new), `apps/frontend/.dockerignore` (new)
  - `apps/frontend/next.config.ts` (add `output: "standalone"`)
  - `k8s/` directory (new, 11 YAML files — app-level manifests only, no namespace)
- **CthuTool repo** (separate change):
  - `gitops/namespaces/pixel-playground.yaml`
  - `gitops/apps/pixel-playground/app-of-apps.yaml`
  - `gitops/bootstrap/.gitkeep`
- **CI**: `.github/workflows/ci.yml` (new `docker` job)
- **Dependencies**: None added — `@langchain/langgraph-cli` and `@nestjs/cli` are already in devDependencies
- **Breaking**: None — purely additive; existing dev workflow untouched

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        GitOps 部署架构                                 │
│                                                                      │
│   PixelPlayground (app repo)          CthuTool (homelab 总仓库)         │
│   ════════════════════════            ═══════════════════════         │
│                                                                      │
│   产出: Docker 镜像 + k8s YAML         gitops/ ← 集群级 GitOps 配置     │
│                                           namespaces/                │
│   ┌──────────────────────┐               apps/pixel-playground/      │
│   │ Dockerfile ×3        │                 Application CR            │
│   │ .dockerignore ×3     │               apps/cthutool/ (将来)       │
│   │ next.config.ts       │                bootstrap/                │
│   │ k8s/                 │   ArgoCD     apps/ (自己的应用代码)         │
│   │   configmap.yaml     │◄──────────── packages/                    │
│   │   secret.yaml        │   轮询                                    │
│   │   frontend/          │                                           │
│   │   backend/           │         ┌──────────────────────┐         │
│   │   langgraph-server/  │         │      k3s 集群          │         │
│   │   langgraph-postgres/│         │  (ArgoCD 自动同步)     │         │
│   └──────────────────────┘         └──────────────────────┘         │
│                                                                      │
│   CI: build → push GHCR                                              │
└──────────────────────────────────────────────────────────────────────┘
```

## Service Topology

```
frontend:7000 ──► backend:3000 ──► langgraph-server:8123 ──► langgraph-postgres:5432
  (Next.js)        (NestJS)         (LangGraph API)             (PG 17, dedicated)
```
