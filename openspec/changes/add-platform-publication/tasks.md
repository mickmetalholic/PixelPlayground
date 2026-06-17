## 1. Shared API Contracts

- [ ] 1.1 Add `PlatformPublication` discriminated-union type with placeholder `XiaoheiheContent` and `XiaohongshuContent` shapes under `packages/api`.
- [ ] 1.2 Add placeholder `PipelineNode` union, per-platform `PLATFORM_PIPELINES` config, and helper functions (`isTerminalNode`, `isHumanNode`, `nextNode`) under `packages/api`.
- [ ] 1.3 Add shared tRPC procedures for platform publication listing, selected-event update, and pipeline transition.
- [ ] 1.4 Add `PlatformPublisher` interface to `packages/api` (or keep it in backend if it references NestJS types — decide during implementation).
- [ ] 1.5 Add focused `packages/api` router tests for platform publication procedure validation and discriminated-union type narrowing.

## 2. Backend Platform Publication Base Module

- [ ] 2.1 Create `GameDiscountPlatformBaseModule` with in-memory `PlatformPublicationRepository`.
- [ ] 2.2 Implement `PlatformPublicationService` with CRUD, subset validation (`selectedIds ⊆ parent pool`), and `transition()` validation using the shared `PLATFORM_PIPELINES` config.
- [ ] 2.3 Implement auto-creation: when a pool transitions to `ready`, create one `PlatformPublication` per active platform with inherited `selectedDiscountEventIds`.
- [ ] 2.4 Implement `getNextUnpublishedPool(platform, type)`: find the most recent `ready` pool not yet covered by a `published` publication for the given platform.
- [ ] 2.5 Wire the backend tRPC context so platform publication procedures resolve through the base module.
- [ ] 2.6 Add backend unit tests for CRUD, transition validation, subset constraint enforcement, auto-creation, and unpublished-pool query.

## 3. Per-Platform Backend Modules

- [ ] 3.1 Create `XiaoheiheModule` with a `XiaoheihePublisherService` implementing `PlatformPublisher` (placeholder: `validateFormat` and `publish` return typed stubs).
- [ ] 3.2 Create `XiaohongshuModule` with a `XiaohongshuPublisherService` implementing `PlatformPublisher` (placeholder: `validateFormat` and `publish` return typed stubs).
- [ ] 3.3 Register both platform modules as imports of the base module or the root app module.
- [ ] 3.4 Add backend unit tests for placeholder publisher behavior and module registration.

## 4. Frontend Platform Publication Workspace

- [ ] 4.1 Wire a platform publication list into the pool detail view (`/content-production/steam-daily-discounts/[draftId]`), showing one row per platform with current pipeline node.
- [ ] 4.2 Build a publication detail sub-route (e.g. `[publicationId]`) with back navigation, platform-specific content fields, and pipeline progress display.
- [ ] 4.3 Render pipeline progress using the shared `PLATFORM_PIPELINES` config, highlighting the current node.
- [ ] 4.4 Add selected-event trimming UI in the publication detail view to reduce `selectedDiscountEventIds` from the inherited pool set.
- [ ] 4.5 Add loading, error, empty, and terminal-node states for all publication views.

## 5. Verification

- [ ] 5.1 Run focused package API tests for platform publication router contracts.
- [ ] 5.2 Run focused backend tests for the base module and per-platform modules.
- [ ] 5.3 Run focused frontend component tests for the publication workspace.
- [ ] 5.4 Run `pnpm lint` or the narrowest Biome check covering changed files.
- [ ] 5.5 Run `openspec validate add-platform-publication --type change --strict` when CLI is available.
