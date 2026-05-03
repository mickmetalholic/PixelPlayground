## ADDED Requirements

### Requirement: Default workspace entry route

The frontend SHALL make the application root route enter the workspace by default.

#### Scenario: Root route opens default workspace

- **WHEN** a user visits `/`
- **THEN** the user is taken to `/workspace/data-management/steam-game-metadata`

### Requirement: Workspace supports semantic section and item routes

The frontend SHALL expose semantic workspace routes for the initial data management and content production views.

#### Scenario: Data management route renders

- **WHEN** a user visits `/workspace/data-management/steam-game-metadata`
- **THEN** the workspace renders the `数据管理` section with `Steam 游戏元信息管理` selected

#### Scenario: Content production route renders

- **WHEN** a user visits `/workspace/content-production/steam-daily-discounts`
- **THEN** the workspace renders the `内容生产` section with `Steam 每日折扣` selected

### Requirement: Workspace shell renders top-level navigation

The frontend SHALL render a workspace top navigation with exactly the initial top-level entries `数据管理` and `内容生产`.

#### Scenario: Top navigation entries are visible

- **WHEN** a user opens any valid workspace route
- **THEN** the top navigation displays `数据管理` and `内容生产`

#### Scenario: Active top navigation follows route

- **WHEN** a user opens a valid workspace route
- **THEN** the top navigation visually marks the section matching the route as active

### Requirement: Workspace shell renders contextual sidebar navigation

The frontend SHALL render a left sidebar whose visible menu items come from the active top-level section.

#### Scenario: Data management sidebar item is visible

- **WHEN** a user opens `/workspace/data-management/steam-game-metadata`
- **THEN** the left sidebar displays `Steam 游戏元信息管理`

#### Scenario: Content production sidebar item is visible

- **WHEN** a user opens `/workspace/content-production/steam-daily-discounts`
- **THEN** the left sidebar displays `Steam 每日折扣`

#### Scenario: Active sidebar item follows route

- **WHEN** a user opens a valid workspace item route
- **THEN** the sidebar visually marks the item matching the route as active

### Requirement: Workspace navigation links update the route

The frontend SHALL use links for top navigation and sidebar navigation so users can move between workspace routes without losing bookmarkable URLs.

#### Scenario: Top navigation changes section

- **WHEN** a user activates the `内容生产` top navigation item from the data management route
- **THEN** the route changes to `/workspace/content-production/steam-daily-discounts`

#### Scenario: Sidebar navigation preserves semantic route

- **WHEN** a user activates a visible sidebar item
- **THEN** the route changes to that item's configured semantic workspace URL

### Requirement: Main workspace area remains blank for initial shell

The frontend SHALL reserve the main workspace content area without implementing Steam feature content in this change.

#### Scenario: Valid workspace route has no Steam feature UI

- **WHEN** a user opens any valid workspace route
- **THEN** the main content area renders as a neutral blank work area without Steam metadata forms, tables, discount generation controls, or feature copy

### Requirement: Invalid workspace route parameters are rejected

The frontend SHALL reject workspace URLs whose `section` or `item` route parameter is not defined in the workspace navigation config.

#### Scenario: Unknown workspace section is not found

- **WHEN** a user visits `/workspace/unknown/steam-game-metadata`
- **THEN** the frontend renders a not-found state

#### Scenario: Unknown workspace item is not found

- **WHEN** a user visits `/workspace/data-management/unknown`
- **THEN** the frontend renders a not-found state
