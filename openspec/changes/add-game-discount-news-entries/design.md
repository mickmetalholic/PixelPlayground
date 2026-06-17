## Context

PixelPlayground already has Steam game metadata and game discount event concepts. Steam metadata has a Nest backend-backed repository and collection flow, while discount events are still read from shared mock data in `packages/api`. The new content workflow needs backend-owned state because a news draft must remember selected discount events, published drafts must affect future candidate filtering, and external automation should be able to create drafts without going through the frontend.

The first implementation should keep the data source mock-backed and in-memory. The important change is the service boundary: discount facts and news draft state should be reachable from the Nest backend through the shared tRPC contract.

## Goals / Non-Goals

**Goals:**

- Add a backend `GameDiscountEventsModule` that wraps the existing mock discount event source behind a repository/service boundary.
- Add a backend `GameDiscountNewsModule` that owns in-memory news draft entries.
- Allow external automation to create news drafts through the Nest backend tRPC endpoint.
- Let users create a draft, retrieve ranked eligible discount candidates, select discount events, and save those selections.
- Exclude discount event IDs that have already appeared in published news entries while allowing the same game to appear again in a future discount event.
- Keep the first version deterministic and testable with mock data.

**Non-Goals:**

- Generate article titles, summaries, or body content.
- Publish to external channels.
- Persist data in a database.
- Build scheduling, approval audit history, or multi-user permissions.
- Ingest live Steam discount feeds.

## Decisions

### Backend owns both discount reads and news draft state

Create `apps/backend/src/modules/game-discount-events/` and `apps/backend/src/modules/game-discount-news/`. The discount-events module exposes sorted, joined, current-event-capable reads over the existing mock data. The news module stores drafts and calls the discount-events service to build candidate lists.

Alternative considered: let the news module import `packages/api` mock data directly. That would be faster, but it leaves the backend draft workflow depending on a frontend/shared mock helper instead of a real service boundary.

### Keep tRPC as the external backend API

Extend the shared API contract with discount news entry types and procedures under the existing Steam-oriented API surface, preferably `steam.discountNews.*`. The Nest backend already exposes the shared `appRouter` at `/trpc`, and the frontend already has a backend tRPC client. Keeping this path avoids introducing a parallel REST contract for the same workflow.

Alternative considered: add dedicated Nest REST controllers for automation. REST would be easy to call from scripts, but it would duplicate validation and typing already handled by the tRPC contract.

### Draft candidates are computed, selections are stored

Creating a draft stores an empty draft. Candidate retrieval computes eligible events from current discount data each time and marks events that are already selected on the draft. Saving selections writes only selected discount event IDs to the draft.

Alternative considered: persist a candidate snapshot when the draft is created. That is useful later for auditability, but it makes the first version heavier and can surface stale discount rows before the content workflow needs that behavior.

### Published filtering uses discount event IDs

The dedupe key is `discountEventId`, not `steamId`. A game can appear again in a future promotion if the event ID is different. Candidate queries exclude event IDs selected by entries whose status is `published`.

Alternative considered: dedupe by game. That would suppress valid future discounts for the same game, which does not match the desired editorial behavior.

### Deterministic ranking replaces content generation

Candidates are sorted by a deterministic score: `newHistoricLow` first, then `historicLow`, then higher discount percent, then nearer end date, then newer start date. The response includes a score and readable reason so users can understand why an event was recommended.

Alternative considered: AI-generated ranking or editorial text. That belongs with the later content-generation change.

### News entry carries a type field for future content categories

Each news entry has a `type` field (e.g. `dailyDeal`, `category`, `publisher`, `thematic`, `seasonalSale`). The first implementation only uses `dailyDeal`, but the field is required at creation so later categories (RPG specials, publisher spotlights, seasonal sale roundups) share the same pool model. Candidate extraction dispatches to a type-specific filter strategy — `dailyDeal` currently passes all current events through, while future types will apply additional filters (by genre, publisher, tag, etc.) without restructuring the shared pipeline.

Alternative considered: separate data collections per content type. That would duplicate the pool CRUD, status machine, and tRPC contract for each category. A single model with a discriminator field keeps the surface area small and makes cross-type queries (e.g. "show me all drafts regardless of type") trivial.

## Risks / Trade-offs

- In-memory draft state disappears on backend restart -> acceptable for the first mock flow; keep repository interfaces narrow so a database can replace them later.
- Shared tRPC router currently falls back to local mock behavior when backend service ports are missing -> add explicit service ports for discount events and discount news so backend and frontend BFF can delegate cleanly.
- Current mock discount data contains mostly historical events -> tests should inject or seed at least one current event, and UI empty states must handle no eligible candidates.
- Candidate computation can change between draft creation and selection -> first version accepts live recomputation; later audit requirements can add candidate snapshots.
- Nested tRPC procedure naming may require small router restructuring -> keep the public intent as `steam.discountNews.*`, but allow implementation to use the repo's supported router nesting pattern.

## Future LangGraph Integration

Content generation (title, summary, body) and multi-step editorial workflows will be orchestrated by a LangGraph agent in `apps/langgraph-server`. The agent will call the tRPC procedures defined in this change as tools — it does not own business state. The NestJS backend remains the source of truth for draft data, status transitions, and candidate computation.

LangGraph's `interrupt()` will handle the human-in-the-loop pause for content review, while the NestJS service layer exposes a narrow `transition(id, status)` method that the agent calls to advance draft state through the editorial pipeline.

No changes are needed in this change's implementation to support this — the tRPC contract and service boundary are already designed for automation callers.
