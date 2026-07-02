## 1. Shared API Contracts

- [x] 1.1 Add shared discount news entry, candidate, status, request, and response types under `packages/api`, including the `NewsCycleType` union (`dailyDeal`, `seasonalSale`, `publisherSale`, `genreSale`, `thematic`) with `dailyDeal` as the only active member.
- [x] 1.2 Extend the app context service ports so backend-backed discount events and discount news services can be injected without local mock reads.
- [x] 1.3 Add shared tRPC procedures for discount news draft creation, entry listing, candidate retrieval, and selected-event updates.
- [x] 1.4 Update discount event tRPC behavior to delegate through the backend service boundary when the service is available.
- [x] 1.5 Add focused `packages/api` router tests for discount news procedure validation, service delegation, and fallback boundaries where applicable.

## 2. Backend Discount Events Module

- [x] 2.1 Create `GameDiscountEventsModule` with repository and service classes backed by the existing mock discount event source and Steam metadata repository.
- [x] 2.2 Implement joined discount event listing with orphan exclusion, pagination, and existing sort semantics.
- [x] 2.3 Implement current discount event filtering using injectable or test-controllable time.
- [x] 2.4 Wire the backend tRPC context so discount event procedures resolve through the backend module.
- [x] 2.5 Add backend unit tests for mock reads, joined game summaries, orphan exclusion, current-event filtering, and tRPC service wiring.

## 3. Backend Discount News Module

- [x] 3.1 Create `GameDiscountNewsModule` with an in-memory repository for draft entries.
- [x] 3.2 Implement draft creation with stable IDs, `dailyDeal` type, `draft` status, empty selected event IDs, and timestamps.
- [x] 3.2b Expose a narrow `updateStatus` or `transition` method on the news service that validates allowed transitions, even though only `draft` status is used in this change.
- [x] 3.3 Implement entry listing sorted by creation time descending.
- [x] 3.4 Implement selected discount event update with unknown-draft errors, unknown-event validation, order preservation, and `updatedAt` changes.
- [x] 3.5 Add backend unit tests for draft lifecycle behavior and selected-event update failure cases.

## 4. Candidate Extraction

- [x] 4.1 Implement candidate extraction from backend current discount events for a target draft, dispatching through a `SelectionStrategy` registry keyed by `NewsCycleType`.
- [x] 4.1b Implement the active `dailyDeal` strategy: shared current-event filtering, ready-pool exclusion, no additional type-specific filter, deterministic ranking, then limit.
- [x] 4.1c Structure inactive strategies (`seasonalSale`, `publisherSale`, `genreSale`, `thematic`) so candidate requests return a typed unsupported-strategy error instead of silently reusing `dailyDeal`.
- [x] 4.1d Keep the shared candidate pipeline extensible so future types can add filter strategies without restructuring the flow (current-events → ready-exclusion → type-specific filter → ranking → limit).
- [x] 4.2 Exclude discount event IDs selected by entries with status `ready` while allowing different event IDs for the same Steam game.
- [x] 4.3 Preserve or mark already-selected events for the active draft when they remain available.
- [x] 4.4 Implement deterministic scoring and ranking by historic-low type, discount percent, end time, and start time.
- [x] 4.5 Return candidate `score`, `reason`, joined game identity, discount fields, and `alreadySelected` state.
- [x] 4.6 Add tests covering ready event filtering, same-game future-event eligibility, `dailyDeal` strategy dispatch, unsupported inactive strategies, ranking order, limit application, and explanation fields.

## 5. Frontend News Entry Workspace

- [x] 5.1 Wire the existing `steam-daily-discounts` sidebar entry to the real workspace component instead of the placeholder.
- [x] 5.2 Build the draft list view (default route) with draft table/cards, create-draft button, type badge, selected-event count, timestamps, and loading/error/empty states.
- [x] 5.3 Build the draft detail sub-route (`[draftId]`) with a back-to-list navigation and candidate fetching through the backend-backed tRPC path.
- [x] 5.4 Render candidate rows in the detail view with game identity, discount period, discount percent, price, historic-low type, score, reason, and checkbox selection.
- [x] 5.5 Save selected candidate event IDs from the detail view to the backend draft and reflect updated state after returning to the draft list.
- [x] 5.6 Keep title, summary, body generation, and publish-channel controls out of the UI for this change.

## 6. Verification

- [x] 6.1 Run focused package API tests for Steam router and discount news contracts.
- [x] 6.2 Run focused backend tests for discount event and discount news modules.
- [x] 6.3 Run focused frontend validation or component tests for the discount news entry workspace when available.
- [x] 6.4 Run `pnpm lint` or the narrowest Biome check covering changed files.
- [x] 6.5 Run `openspec validate add-game-discount-news-entries --type change --strict`.
