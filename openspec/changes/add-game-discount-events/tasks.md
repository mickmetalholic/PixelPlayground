## 1. Shared API Contract and Mock Data

- [ ] 1.1 Add discount event types, price type reuse, and historic-low type identifiers in `packages/api`.
- [ ] 1.2 Add fixed mock discount event records keyed by existing Steam IDs.
- [ ] 1.3 Add a list helper that joins discount events to existing mock game summaries, excludes unresolved games, sorts by `startAt` descending, and paginates.
- [ ] 1.4 Expose `steam.discountEvents` as a read-only tRPC query.
- [ ] 1.5 Add API tests for default results, joined game summaries, descending sort, limit handling, and unresolved game exclusion.
- [ ] 1.6 Verify API work with `pnpm --filter @pixel-playground/api test`.

## 2. Frontend Workspace

- [ ] 2.1 Add `/data-management/game-discount-events` to the data-management workspace navigation.
- [ ] 2.2 Route the new workspace item to a dedicated discount event workspace component.
- [ ] 2.3 Build a compact read-only discount event table showing game identity, Steam ID, period, discount percent, discounted price, and type badge.
- [ ] 2.4 Add loading, error retry, and empty states consistent with existing workspace components.
- [ ] 2.5 Keep table overflow contained inside the workspace pane for desktop and mobile layouts.
- [ ] 2.6 Verify frontend work with the narrowest available frontend test or type/lint command.

## 3. Validation and Documentation

- [ ] 3.1 Run `openspec validate --change add-game-discount-events`.
- [ ] 3.2 Run the relevant root lint or package lint command if API/frontend verification does not already cover formatting.
- [ ] 3.3 Update task checkboxes as implementation slices complete.
