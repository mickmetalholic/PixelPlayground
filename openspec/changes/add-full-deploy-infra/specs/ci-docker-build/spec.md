## ADDED Requirements

### Requirement: CI builds all three Docker images on main push

The CI workflow SHALL build Docker images for all three apps on every push to the `main` branch.

#### Scenario: All three images build successfully on main push

- **WHEN** a commit is pushed to `main` and the `quality` job passes
- **THEN** the `docker` job builds the langgraph-server image via `langgraph build`
- **AND** builds the backend image via `docker build -f apps/backend/Dockerfile`
- **AND** builds the frontend image via `docker build -f apps/frontend/Dockerfile`
- **AND** the job succeeds if all three images build without errors

#### Scenario: Any build failure fails the CI check

- **WHEN** any one of the three Docker builds exits with a non-zero code
- **THEN** the `docker` job fails and the overall CI run is marked as failed

#### Scenario: Docker job does not run on PR branches

- **WHEN** a commit is pushed to a non-`main` branch or a pull request is opened
- **THEN** the `docker` job is skipped
- **AND** the existing `quality` and `coverage` jobs run as before

### Requirement: CI pushes images to GHCR on successful build

The CI workflow SHALL push all three built images to GitHub Container Registry with commit SHA and `latest` tags.

#### Scenario: Images are pushed with commit SHA tags

- **WHEN** the Docker build steps succeed for all three apps
- **THEN** images are pushed to `ghcr.io/mickmetalholic/pixelplayground/<app>:sha-<7-char-hash>` for each app

#### Scenario: Images are pushed with latest tags

- **WHEN** the Docker build steps succeed for all three apps
- **THEN** images are pushed to `ghcr.io/mickmetalholic/pixelplayground/<app>:latest` for each app

### Requirement: Docker builds run in parallel

The three app Docker builds SHALL execute concurrently within the `docker` job.

#### Scenario: Builds do not block each other

- **WHEN** the `docker` job runs
- **THEN** the langgraph-server, backend, and frontend build steps start independently
- **AND** the slowest build determines the total job duration, not the sum of all three
