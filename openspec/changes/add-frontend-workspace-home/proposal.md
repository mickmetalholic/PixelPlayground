## Why

The frontend home page is still a tRPC demo, so it does not yet provide an operational entry point for the Steam-oriented data and content workflows PixelPlayground is moving toward. A workspace shell gives the app a stable navigation foundation before adding real Steam metadata management and daily discount production features.

## What Changes

- Replace the root frontend demo entry with a default workspace entry path.
- Add semantic workspace routes under `/workspace/[section]/[item]`.
- Add top-level navigation for `数据管理` and `内容生产`.
- Add a context-specific left sidebar for each top-level section.
- Add the initial sidebar items:
  - `Steam 游戏元信息管理` under `数据管理`
  - `Steam 每日折扣` under `内容生产`
- Keep the main workspace content area blank for this change.
- Render clear active states for the selected top navigation item and sidebar item.
- Return a not-found state for unknown workspace route parameters.

## Capabilities

### New Capabilities

- `frontend-workspace-shell`: Defines the frontend workspace routing shell, top navigation, contextual sidebars, active states, default entry route, blank content area, and invalid route handling.

### Modified Capabilities

None.

## Impact

- Affected app: `apps/frontend`.
- Affected routes:
  - `/`
  - `/workspace/data-management/steam-game-metadata`
  - `/workspace/content-production/steam-daily-discounts`
  - invalid `/workspace/[section]/[item]` combinations
- No backend, tRPC API, LangGraph, database, dependency, or shared package changes are required.
- Verification should focus on frontend build/type safety and route behavior.
