## 1. Workspace Routing

- [x] 1.1 Add a workspace navigation config for top-level sections, default items, sidebar items, labels, and hrefs.
- [x] 1.2 Replace the frontend root page behavior so `/` enters `/workspace/data-management/steam-game-metadata`.
- [x] 1.3 Add the dynamic workspace route for `/workspace/[section]/[item]`.
- [x] 1.4 Validate route params against the workspace navigation config and render `notFound` for unknown sections or items.

## 2. Workspace Shell UI

- [x] 2.1 Create a workspace shell component with a top navigation bar, contextual left sidebar, and main work area.
- [x] 2.2 Render the top navigation entries `数据管理` and `内容生产`.
- [x] 2.3 Render `Steam 游戏元信息管理` only for the data management section sidebar.
- [x] 2.4 Render `Steam 每日折扣` only for the content production section sidebar.
- [x] 2.5 Add restrained active styles for the selected top navigation entry and sidebar item.
- [x] 2.6 Keep the main content area as a neutral blank work area without Steam feature UI or feature copy.
- [x] 2.7 Add a simple responsive layout fallback for narrower viewports.

## 3. Navigation Behavior

- [x] 3.1 Ensure top navigation links route to each section's default workspace item.
- [x] 3.2 Ensure sidebar navigation links route to each item's semantic workspace URL.
- [x] 3.3 Confirm refresh and direct navigation preserve the correct active section and item.

## 4. Verification

- [x] 4.1 Run the narrow frontend verification command, such as `pnpm --filter @pixel-playground/frontend build`.
- [ ] 4.2 Manually verify `/` reaches `/workspace/data-management/steam-game-metadata`.
- [ ] 4.3 Manually verify both valid workspace routes render the expected top navigation and sidebar active states.
- [ ] 4.4 Manually verify invalid workspace routes render a not-found state.
- [x] 4.5 Run `pnpm exec openspec validate add-frontend-workspace-home --strict`.
