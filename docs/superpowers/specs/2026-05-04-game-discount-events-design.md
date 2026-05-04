# Game Discount Events Design

## Summary

Add a read-only Data Management workspace for game discount events. Each event references existing Steam game metadata by Steam ID and records a sale period, discount percent, discounted price, and historic-low classification. The first implementation uses fixed in-memory mock data and displays a compact list sorted by discount start time descending.

## Confirmed Scope

- Add a standalone Data Management page at `/data-management/game-discount-events`.
- Keep the first version read-only.
- Use mock in-memory discount event records.
- Join events to existing Steam game metadata so each row includes game information.
- Sort events by `startAt` descending.
- Use integer minor-unit pricing with currency and formatted display, aligned with existing Steam price metadata.
- Exclude CRUD, real database persistence, live Steam discount ingestion, filtering, search, and calendar views.

## Data Model

Discount events will be represented as their own entity:

- `id`: stable event identifier.
- `steamId`: foreign key to existing Steam game metadata.
- `startAt`: ISO timestamp for discount start.
- `endAt`: ISO timestamp for discount end.
- `discountPercent`: integer percent, such as `50`.
- `discountedPrice`: currency plus integer final amount in minor units, with a formatted display value.
- `type`: `nonHistoricLow`, `historicLow`, or `newHistoricLow`.

The API list item will include the event fields and a joined game summary containing Steam ID, English name, Chinese name, capsule image, and header image. Events that cannot be joined to a known game are excluded from the first version.

## API Design

Add a read-only `steam.discountEvents` tRPC query in the existing Steam router. The query accepts `limit` and optional `cursor`, defaults to a compact page size, joins event records to mock game metadata, sorts by `startAt` descending, and returns `{ items, pageInfo, total }`.

Keeping the query under `steam` avoids introducing a new top-level router for a Steam-specific data entity. The contract leaves room for later mutation endpoints and persistence without reshaping the read model.

## Frontend Design

Add `Game Discount Event Management` as a sibling to the existing Steam game metadata item in the Data Management sidebar. The workspace renders a dense read-only table with:

- Game identity: capsule image, English name, Chinese name, Steam ID.
- Discount period: start and end time.
- Discount data: percentage, discounted price, and historic-low type badge.
- User-facing states: loading, empty, error with retry.

The UI should reuse existing workspace shell, card, badge, button, and table-like styling patterns. Table overflow should stay inside the workspace pane instead of causing page-level horizontal scrolling.

## Testing

API tests should cover:

- Default list returns mock events.
- Rows include joined game summaries.
- Items are sorted by `startAt` descending.
- `limit` restricts returned item count.
- Orphan mock events are excluded.

Frontend verification should use the narrowest available route/component checks. If a focused component test is not already practical in the app, TypeScript/lint plus manual local browser verification is acceptable for the first read-only page.

## OpenSpec

The OpenSpec change is `add-game-discount-events`. It introduces the `game-discount-events` capability and includes proposal, design, spec, and task artifacts under `openspec/changes/add-game-discount-events/`.

## Open Questions

None for the first read-only mock implementation.
