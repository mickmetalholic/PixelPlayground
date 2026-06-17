## Why

The `add-game-discount-news-entries` change establishes pool management (NewsCycle) — the fact source of selected discount events for content production. The next step is creating per-platform publications that consume those pools to generate platform-specific content (articles, cover images, tags, etc.) and publish to external channels like 小黑盒 and 小红书.

Each platform has a distinct content shape, publishing API, and editorial pipeline. The platform publication layer must model these differences while sharing the common pool-consumption workflow (status transitions, candidate queries, pool deduplication).

## What Changes

- Add a shared `PlatformPublication` discriminated-union type in `packages/api` with per-platform content shapes.
- Add a shared `PipelineNode` union type and per-platform pipeline configurations (`PLATFORM_PIPELINES`) in `packages/api` so frontend, backend, and LangGraph all consume the same pipeline definitions.
- Add a backend `GameDiscountPlatformBaseModule` that provides common PlatformPublication CRUD, status transition, and candidate-subset validation.
- Add per-platform backend modules (`xiaoheihe/`, `xiaohongshu/`) implementing a `PlatformPublisher` interface, with placeholder implementations for the first version.
- Expose tRPC procedures for creating, listing, and transitioning platform publications.
- Reserve a frontend detail sub-route per platform for managing a single publication's content and pipeline progress, following the list-first pattern established in the pool change.
- Keep LangGraph agent implementation, real publish-API calls, and specific pipeline node logic as placeholders for later changes.

## Capabilities

### New Capabilities

- `platform-publication`: Backend base module and per-platform module structure for platform publication CRUD, pipeline progression, and pool-subset management.

## Impact

- `packages/api`: Adds PlatformPublication types, PipelineNode types, PLATFORM_PIPELINES config, and tRPC procedures.
- `apps/backend`: Adds `GameDiscountPlatformBaseModule`, placeholder platform modules (`xiaoheihe`, `xiaohongshu`), and tRPC wiring.
- `apps/frontend`: Adds basic platform publication detail view with pipeline progress display, wired through existing workspace shell.
- New OpenSpec capability under `openspec/changes/add-platform-publication/specs/platform-publication/`.
