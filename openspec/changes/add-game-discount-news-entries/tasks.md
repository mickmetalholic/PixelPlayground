## 1. Shared API Contracts

- [ ] 1.1 Add shared discount news entry, candidate, status, request, and response types under `packages/api`, including the `NewsCycleType` union with `dailyDeal` as the only active member.
- [ ] 1.2 Extend the app context service ports so backend-backed discount events and discount news services can be injected without local mock reads.
- [ ] 1.3 Add shared tRPC procedures for discount news draft creation, entry listing, candidate retrieval, and selected-event updates.
- [ ] 1.4 Update discount event tRPC behavior to delegate through the backend service boundary when the service is available.
- [ ] 1.5 Add focused `packages/api` router tests for discount news procedure validation, service delegation, and fallback boundaries where applicable.

## 2. Backend Discount Events Module

- [ ] 2.1 Create `GameDiscountEventsModule` with repository and service classes backed by the existing mock discount event source and Steam metadata repository.
- [ ] 2.2 Implement joined discount event listing with orphan exclusion, pagination, and existing sort semantics.
- [ ] 2.3 Implement current discount event filtering using injectable or test-controllable time.
- [ ] 2.4 Wire the backend tRPC context so discount event procedures resolve through the backend module.
- [ ] 2.5 Add backend unit tests for mock reads, joined game summaries, orphan exclusion, current-event filtering, and tRPC service wiring.

## 3. Backend Discount News Module

- [ ] 3.1 Create `GameDiscountNewsModule` with an in-memory repository for draft entries.
- [ ] 3.2 Implement draft creation with stable IDs, `dailyDeal` type, `draft` status, empty selected event IDs, and timestamps.
- [ ] 3.2b Expose a narrow `updateStatus` or `transition` method on the news service that validates allowed transitions, even though only `draft` status is used in this change.
- [ ] 3.3 Implement entry listing sorted by creation time descending.
- [ ] 3.4 Implement selected discount event update with unknown-draft errors, unknown-event validation, order preservation, and `updatedAt` changes.
- [ ] 3.5 Add backend unit tests for draft lifecycle behavior and selected-event update failure cases.

## 4. Candidate Extraction

- [ ] 4.1 Implement candidate extraction from backend current discount events for a target draft, dispatching to a type-specific filter strategy with `dailyDeal` as the only strategy in this change.
- [ ] 4.1b Structure the candidate extraction code path so that future types can add filter strategies without restructuring the shared pipeline (current-events → published-exclusion → type-specific filter → ranking → limit).
- [ ] 4.2 Exclude discount event IDs selected by entries with status `published` while allowing different event IDs for the same Steam game.
- [ ] 4.3 Preserve or mark already-selected events for the active draft when they remain available.
- [ ] 4.4 Implement deterministic scoring and ranking by historic-low type, discount percent, end time, and start time.
- [ ] 4.5 Return candidate `score`, `reason`, joined game identity, discount fields, and `alreadySelected` state.
- [ ] 4.6 Add tests covering published-event filtering, same-game future-event eligibility, ranking order, limit application, and explanation fields.

## 5. Frontend News Entry Workspace

- [ ] 5.1 Add a content-production sidebar entry for discount news entry management.
- [ ] 5.2 Build the workspace shell for draft list, create-draft action, active draft state, and loading/error/empty states.
- [ ] 5.3 Fetch candidates for the active draft through the backend-backed tRPC path.
- [ ] 5.4 Render candidate rows with game identity, discount period, discount percent, price, historic-low type, score, reason, and checkbox selection.
- [ ] 5.5 Save selected candidate event IDs to the backend draft and refresh local UI state after success.
- [ ] 5.6 Keep title, summary, body generation, and publish-channel controls out of the UI for this change.

## 6. Verification

- [ ] 6.1 Run focused package API tests for Steam router and discount news contracts.
- [ ] 6.2 Run focused backend tests for discount event and discount news modules.
- [ ] 6.3 Run focused frontend validation or component tests for the discount news entry workspace when available.
- [ ] 6.4 Run `pnpm lint` or the narrowest Biome check covering changed files.
- [ ] 6.5 Run `openspec validate add-game-discount-news-entries --type change --strict`.
