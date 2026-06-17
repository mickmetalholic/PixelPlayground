## ADDED Requirements

### Requirement: Shared ConfigMap holds non-sensitive configuration

A `ConfigMap` named `pixel-playground-config` in the `pixel-playground` namespace SHALL contain non-sensitive environment variables consumed by all three apps.

#### Scenario: ConfigMap contains required keys

- **WHEN** the ConfigMap is applied
- **THEN** it contains at minimum: `NEST_ORIGIN`, `LANGGRAPH_HOST`, `LANGGRAPH_PORT`, `POSTGRES_DB`, `POSTGRES_HOST`, `PORT` values for each service

#### Scenario: ConfigMap does not contain secrets

- **WHEN** the ConfigMap is inspected
- **THEN** it does NOT contain any password, API key, or token value

### Requirement: Shared Secret holds sensitive credentials

A `Secret` of type `Opaque` named `pixel-playground-secret` in the `pixel-playground` namespace SHALL contain database credentials and any other sensitive values.

#### Scenario: Secret contains PostgreSQL credentials

- **WHEN** the Secret is applied
- **THEN** it contains `POSTGRES_USER` and `POSTGRES_PASSWORD`
- **AND** values are base64-encoded

#### Scenario: Committed Secret uses placeholders

- **WHEN** a developer reads the committed `secret.yaml`
- **THEN** sensitive values are placeholders (e.g., `Q0hBTkdFX01F` with a comment: `# echo -n 'real-password' | base64`)
- **AND** the file includes a setup comment explaining how to generate real values

### Requirement: langgraph-server Deployment and Service

A `Deployment` SHALL manage the langgraph-server container, exposed internally via a `ClusterIP` Service.

#### Scenario: langgraph-server pod runs

- **WHEN** the Deployment is applied
- **THEN** a single replica of the langgraph-server container is running on port 8123
- **AND** the container image is `ghcr.io/mickmetalholic/pixelplayground/langgraph-server:latest`
- **AND** environment variables are sourced from `pixel-playground-config` ConfigMap and `pixel-playground-secret` Secret

#### Scenario: langgraph-server is reachable within the cluster

- **WHEN** another pod resolves `langgraph-server.pixel-playground.svc.cluster.local`
- **THEN** the ClusterIP Service routes traffic to the langgraph-server pod on port 8123

#### Scenario: langgraph-server has health probes

- **WHEN** the pod is running
- **THEN** a liveness probe checks the health endpoint
- **AND** a readiness probe checks the health endpoint before traffic is routed

### Requirement: langgraph-postgres StatefulSet, Service, and PVC

A `StatefulSet` SHALL manage a single PostgreSQL 17 instance with persistent storage, reachable via a ClusterIP `Service`.

#### Scenario: PostgreSQL pod runs with persistent storage

- **WHEN** the StatefulSet is applied
- **THEN** a single PostgreSQL pod is running on port 5432
- **AND** a PersistentVolumeClaim (1Gi+) is bound for `/var/lib/postgresql/data`
- **AND** the PVC uses the cluster's default StorageClass

#### Scenario: PostgreSQL credentials are injected from Secret

- **WHEN** the `langgraph-postgres` pod starts
- **THEN** `POSTGRES_USER` and `POSTGRES_PASSWORD` are set from `pixel-playground-secret`
- **AND** `POSTGRES_DB` and `POSTGRES_HOST` are set from `pixel-playground-config`

#### Scenario: PostgreSQL is reachable by langgraph-server

- **WHEN** langgraph-server resolves `langgraph-postgres.pixel-playground.svc.cluster.local:5432`
- **THEN** the Service routes to the PostgreSQL pod
- **AND** the langgraph-server can connect using the credentials from ConfigMap + Secret

#### Scenario: PVC survives pod restarts

- **WHEN** the PostgreSQL pod is deleted and recreated by the StatefulSet controller
- **THEN** the same PVC is reattached
- **AND** previously written data is preserved

### Requirement: backend Deployment and Service

A `Deployment` SHALL manage the NestJS backend container, exposed internally via a `ClusterIP` Service.

#### Scenario: backend pod runs

- **WHEN** the Deployment is applied
- **THEN** a single replica of the backend container is running on port 3000
- **AND** the container image is `ghcr.io/mickmetalholic/pixelplayground/backend:latest`
- **AND** `LANGGRAPH_BASE_URL` points to `http://langgraph-server.pixel-playground.svc.cluster.local:8123`

#### Scenario: backend is reachable by frontend

- **WHEN** the frontend pod resolves `backend.pixel-playground.svc.cluster.local:3000`
- **THEN** the ClusterIP Service routes traffic to the backend pod

#### Scenario: backend has health probes

- **WHEN** the pod is running
- **THEN** a liveness probe and readiness probe check the health status

### Requirement: frontend Deployment and Service

A `Deployment` SHALL manage the Next.js frontend container, exposed internally via a `ClusterIP` Service.

#### Scenario: frontend pod runs

- **WHEN** the Deployment is applied
- **THEN** a single replica of the frontend container is running on port 7000
- **AND** the container image is `ghcr.io/mickmetalholic/pixelplayground/frontend:latest`
- **AND** `NEST_ORIGIN` points to `http://backend.pixel-playground.svc.cluster.local:3000`

#### Scenario: frontend is reachable within the cluster

- **WHEN** another pod resolves `frontend.pixel-playground.svc.cluster.local:7000`
- **THEN** the ClusterIP Service routes traffic to the frontend pod

### Requirement: k8s manifests are organized by app subdirectory

Manifests SHALL be organized as `k8s/<app-or-resource>/<kind>.yaml` under the repo root.

#### Scenario: Directory structure is navigable

- **WHEN** a developer lists `k8s/`
- **THEN** subdirectories for each app (`frontend/`, `backend/`, `langgraph-server/`, `langgraph-postgres/`) are present
- **AND** shared resources (`configmap.yaml`, `secret.yaml`) are at the `k8s/` root level
- **AND** the namespace resource lives in CthuTool's `gitops/` directory (cluster-level concern), not in this directory

#### Scenario: Manifests are valid for ArgoCD consumption

- **WHEN** `kubectl apply --dry-run=client -f k8s/ --recursive` is executed in a namespace that already exists
- **THEN** all manifests pass schema validation
