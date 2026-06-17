## Why

Discount events currently exist as read-only shared mock data, while the next content workflow needs server-owned draft state and candidate filtering that external automation can call directly. This change creates a backend-backed mock flow for selecting current discounted games into news drafts, while leaving actual article content generation for a later change.

## What Changes

- Add a Nest backend game discount events module backed by the existing mock discount events and mock Steam game metadata.
- Expose backend discount event list behavior so frontend and server-side workflows can depend on a backend service boundary instead of only shared-package mock reads.
- Add a backend game discount news entry module with in-memory draft storage.
- Add backend APIs for creating a news draft, listing drafts, retrieving eligible discount candidates for a draft, and updating the selected discount events on a draft.
- Filter candidates to current discount events and exclude discount event IDs already included in published news entries.
- Sort candidate events deterministically using discount quality signals, then return a limited candidate list for user selection.
- Add a content-production UI flow for creating a draft, viewing ranked candidate discount events, selecting events, and saving the selected set.
- Keep news title/body generation, external publishing integrations, durable database persistence, scheduling, and multi-user audit history out of scope for this change.

## Capabilities

### New Capabilities

- `game-discount-news-entries`: Backend and frontend behavior for managing discount news drafts, retrieving eligible discount event candidates, and saving selected discount events.

### Modified Capabilities

- `game-discount-events`: Move discount event read behavior behind a backend service boundary while preserving the existing mock-backed list semantics.

## Impact

- `apps/backend`: Adds backend modules and tests for discount event reads and news draft/candidate management.
- `packages/api`: Adds shared types and tRPC contract surface for discount news entries and extends the existing discount-event contract as needed.
- `apps/frontend`: Adds or wires the content-production discount news management workspace and delegates relevant tRPC calls through the backend-backed path.
- `openspec/specs/game-discount-events/spec.md`: Gains backend module and service-boundary requirements while preserving mock-data behavior.
- New OpenSpec capability under `openspec/changes/add-game-discount-news-entries/specs/game-discount-news-entries/spec.md`.
