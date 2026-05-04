## Why

PixelPlayground can review Steam game metadata, but it does not yet model time-bounded discount events as first-class data. Adding a read-only game discount event workspace gives data managers a focused view of sale periods, discount strength, sale price, and historic-low classification while preserving the existing mock-first workflow.

## What Changes

- Add a game discount event data contract with a Steam game foreign key, discount period, discount percent, discounted price, and historic-low type.
- Add fixed in-memory mock discount events that join to the existing mock Steam game metadata.
- Expose a read-only tRPC query for discount event list data, sorted by discount start time descending.
- Add a new Data Management sidebar item and page for `Game Discount Event Management`.
- Render a compact read-only list that includes associated game information and discount event fields.
- Keep the first version read-only: no create, edit, delete, filtering, real database persistence, or live Steam price ingestion.

## Capabilities

### New Capabilities

- `game-discount-events`: Covers read-only management of Steam game discount events, including mock event data, game metadata association, sorted list retrieval, and data-management UI presentation.

### Modified Capabilities

None.

## Impact

- Affected shared package: `packages/api` for discount event types, mock data, list query, and tests.
- Affected frontend app: `apps/frontend` for workspace navigation, page routing, tRPC consumption, table component, and UI states.
- Affected docs/specs: OpenSpec artifacts and a Superpowers design note.
- No new runtime dependency is expected.
