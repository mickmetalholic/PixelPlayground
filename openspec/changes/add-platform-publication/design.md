## Context

The `add-game-discount-news-entries` change builds the pool layer (NewsCycle) — a fact source of selected discount events that platform teams consume. This change adds the PlatformPublication layer that connects pools to per-platform content production and publishing.

## Goals / Non-Goals

**Goals:**

- Define a shared `PlatformPublication` discriminated-union type with per-platform content shapes.
- Define a shared `PipelineNode` union and `PLATFORM_PIPELINES` config so frontend, backend, and LangGraph all consume the same pipeline definitions.
- Add a backend base module for common PlatformPublication CRUD, transition validation, and pool-subset enforcement.
- Add per-platform backend modules implementing a `PlatformPublisher` interface, with placeholder implementations.
- Expose tRPC procedures for publication listing, selected-event updates, and pipeline transitions.
- Add a frontend detail sub-route per platform showing pipeline progress and content, using shared pipeline config.
- Auto-create PlatformPublications for each active platform when a pool transitions to `ready`.

**Non-Goals:**

- LangGraph agent implementation or any AI content generation logic.
- Real publish-API calls to 小黑盒, 小红书, or any external platform.
- Authenticated user identity for pipeline actions.
- Durable database persistence (in-memory, like the pool layer).
- Defining the full set of pipeline nodes per platform — only placeholder values are needed.

## Decisions

### Single model with discriminated union

All platforms share a single `PlatformPublication` model with a `platform` discriminator field. The `content` shape varies by platform via a discriminated union.

```ts
type PlatformPublication =
  | { platform: 'xiaoheihe'; content: XiaoheiheContent | null; ...shared }
  | { platform: 'xiaohongshu'; content: XiaohongshuContent | null; ...shared };
```

Shared fields (`id`, `newsCycleId`, `status`, `selectedDiscountEventIds`, `publishedUrl`, timestamps) live on every branch, while `content` is the only platform-varying field. TypeScript narrows `content` automatically when switching on `platform`.

Alternative considered: separate models per platform. That would give natural type isolation per platform's content shape, but it duplicates CRUD logic, transition handling, pool queries, and tRPC procedures for every new platform. The discriminated union keeps the 80% common surface shared and the 20% platform-specific logic isolated in per-platform modules.

### PipelineNode is a shared type, not a backend implementation detail

The `PipelineNode` union and `PLATFORM_PIPELINES` mapping live in `packages/api`. All three layers consume them:

```
packages/api                ← PipelineNode types, PLATFORM_PIPELINES, helpers
  ├── apps/frontend         ← renders pipeline progress, highlights current node
  ├── apps/backend          ← validates transitions, serves pipeline config
  └── apps/langgraph-server ← executes nodes in sequence, interrupt on human nodes
```

Adding a node (or changing a platform's pipeline) is a type/config change in one package, visible to all layers.

Alternative considered: define pipeline nodes only in the LangGraph server. That hides the flow from the frontend and backend, making it impossible to show pipeline progress in the UI or validate transitions in the backend without duplicating the definition.

### Pool-to-publication is 1:1 per platform

One pool produces exactly one PlatformPublication per platform. A pool of 15 selected games results in one 小红书 publication. If the platform team wants to split into multiple posts, they handle that within the content editing step for the single publication.

This keeps the model simple: `newsCycleId` is a straightforward foreign key, and `getNextUnpublishedPool` returns a single pool per platform.

Alternative considered: one pool → many publications per platform. This adds complexity (ordering, dedup across siblings) that isn't needed yet. If a platform later needs the pool split into multiple posts, the content model can evolve to support sub-items within a single publication.

### Auto-creation on pool ready

When a NewsCycle transitions from `draft` to `ready`, the backend service creates one PlatformPublication per active platform. Each publication inherits the full `selectedDiscountEventIds` list from the pool, and `status` starts at the first node in that platform's pipeline.

The user can later trim `selectedDiscountEventIds` on a per-platform basis if a platform doesn't need all pool games.

Alternative considered: manual creation. This requires the user to remember to create publications for every platform, which adds friction for a step that has no decision content — if a pool is ready, every platform needs a publication.

### Base module + per-platform modules

```
apps/backend/src/modules/
  game-discount-platform/              ← base: CRUD, transition, subset validation
    platform-publication.repository.ts
    platform-publication.service.ts
    platform-publication-base.module.ts
    modules/
      xiaoheihe/                       ← 小黑盒: PlatformPublisher impl
        xiaoheihe-publisher.service.ts
        xiaoheihe-formatter.service.ts
        xiaoheihe.module.ts
      xiaohongshu/                     ← 小红书: PlatformPublisher impl
        xiaohongshu-publisher.service.ts
        xiaohongshu-formatter.service.ts
        xiaohongshu.module.ts
```

Per-platform modules implement a `PlatformPublisher` interface for platform-specific behavior (content formatting, publish action). In this change, these are placeholder implementations.

Alternative considered: separate NestJS apps per platform. Overhead is too high for what is purely a modularity concern — a single backend with platform sub-modules scales well into the foreseeable platform count.

### Content production strategy is selected by platform and pool type

The pool layer decides what games were selected; the publication layer decides how those selected games become platform-specific content. Content generation and formatting therefore dispatch through a `ContentProductionStrategy` keyed by both `platform` and the parent `NewsCycle.type`.

```
NewsCycle.type       PlatformPublication.platform       Strategy key
dailyDeal       +    xiaoheihe                    ->    xiaoheihe.dailyDeal
dailyDeal       +    xiaohongshu                  ->    xiaohongshu.dailyDeal
publisherSale   +    xiaoheihe                    ->    xiaoheihe.publisherSale
genreSale       +    xiaohongshu                  ->    xiaohongshu.genreSale
```

This keeps selection and content production separate:

- `SelectionStrategy` lives with NewsCycle candidate extraction and is keyed only by `NewsCycle.type`.
- `ContentProductionStrategy` lives with PlatformPublication and is keyed by `(platform, NewsCycle.type)`.
- `PlatformPublisher` remains responsible for platform-specific validation and publish transport behavior, not for choosing games.

In this change, content production strategies are placeholders. The strategy registry and key shape should exist so future LangGraph or formatter work has a stable dispatch boundary, but strategy implementations must not generate real title, body, tags, cover prompts, or call AI providers yet. Unsupported `(platform, type)` combinations should return an explicit unsupported-strategy result instead of falling back to another strategy.

Alternative considered: key content generation only by platform. That would make 小黑盒 daily deals and 小黑盒 publisher-sale roundups share the same generation path even though their content structure, intro framing, and selection explanation differ. The platform-only split is too coarse once multiple pool types exist.

### Frontend follows list-first sub-route pattern

Consistent with the pool workspace design: the default route shows the publication list (per pool), and clicking a publication navigates to a `[publicationId]` sub-route. The detail view shows pipeline progress using the shared `PLATFORM_PIPELINES` config and renders platform-specific content fields.

Alternative considered: drawer for detail. Sub-route was chosen for the pool change so this change follows the same pattern for consistency.

### Content and pipeline nodes are placeholder values

This change defines the type skeleton but not the real pipeline nodes. Placeholder values like `'draft' | 'generating' | 'readyForReview' | 'published' | 'failed'` are used for the `PipelineNode` union. Each platform's `PLATFORM_PIPELINES` entry is a placeholder sequence. Real node definitions (with platform-specific nodes like `generatingCoverImage`, `settingTags`, etc.) will replace them in the LangGraph implementation change.

Content shapes are similarly placeholder — `XiaoheiheContent` and `XiaohongshuContent` define the fields that matter for the data model, but no content generation or validation logic exists yet.

## Risks / Trade-offs

- Discriminated union grows with each new platform -> acceptable trade-off; the alternative (N models) duplicates far more code.
- PipelineNode type must stay in sync with LangGraph graph definition -> the shared type in `packages/api` is the source of truth; LangGraph builds its graph from the same config.
- Auto-creation assumes every active platform wants every pool -> if a platform should skip a pool, the user can archive/delete the auto-created publication. A future change can add per-pool platform toggles.
- Placeholder pipeline nodes may not match the final LangGraph node structure -> the placeholder set is deliberately minimal; the real node set will be defined in the LangGraph change and the type updated accordingly.

## Future LangGraph Integration

Each PlatformPublication's pipeline will be executed by a LangGraph agent in `apps/langgraph-server`. The agent reads the platform's `PLATFORM_PIPELINES` config to determine node order, calls tRPC to transition status between nodes, and uses `interrupt()` at human-review nodes. The shared `PipelineNode` type ensures the agent, backend, and frontend all agree on node identity without any one layer owning the definition.
