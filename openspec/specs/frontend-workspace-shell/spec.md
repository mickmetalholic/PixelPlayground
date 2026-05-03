# frontend-workspace-shell Specification

## Purpose
Define the frontend workspace shell routing, navigation, and content hosting behavior for PixelPlayground's operational tools.

## Requirements
### Requirement: Default workspace entry route
The frontend SHALL make the application root route enter the default workspace tool.

#### Scenario: Root route opens default workspace
- **WHEN** a user visits `/`
- **THEN** the user is redirected to `/data-management/steam-game-metadata`

### Requirement: Workspace supports semantic section and item routes
The frontend SHALL expose semantic workspace routes for the initial data management and content production views.

#### Scenario: Data management route renders
- **WHEN** a user visits `/data-management/steam-game-metadata`
- **THEN** the workspace renders the `数据管理` section with `Steam 游戏元信息管理` selected

#### Scenario: Content production route renders
- **WHEN** a user visits `/content-production/steam-daily-discounts`
- **THEN** the workspace renders the `内容生产` section with `Steam 每日折扣` selected

### Requirement: Workspace shell renders top-level navigation
The frontend SHALL render workspace top navigation with the initial top-level entries `数据管理` and `内容生产`.

#### Scenario: Top navigation entries are visible
- **WHEN** a user opens any valid workspace route
- **THEN** the top navigation displays `数据管理` and `内容生产`

#### Scenario: Active top navigation follows route
- **WHEN** a user opens a valid workspace route
- **THEN** the top navigation visually marks the section matching the route as active

### Requirement: Workspace shell renders contextual sidebar navigation
The frontend SHALL render a left sidebar whose visible menu items come from the active top-level section.

#### Scenario: Data management sidebar item is visible
- **WHEN** a user opens `/data-management/steam-game-metadata`
- **THEN** the left sidebar displays `Steam 游戏元信息管理`

#### Scenario: Content production sidebar item is visible
- **WHEN** a user opens `/content-production/steam-daily-discounts`
- **THEN** the left sidebar displays `Steam 每日折扣`

#### Scenario: Active sidebar item follows route
- **WHEN** a user opens a valid workspace item route
- **THEN** the sidebar visually marks the item matching the route as active

### Requirement: Workspace navigation links update the route
The frontend SHALL use links for top navigation and sidebar navigation so users can move between workspace routes without losing bookmarkable URLs.

#### Scenario: Top navigation changes section
- **WHEN** a user activates the `内容生产` top navigation item from the data management route
- **THEN** the route changes to `/content-production/steam-daily-discounts`

#### Scenario: Sidebar navigation preserves semantic route
- **WHEN** a user activates a visible sidebar item
- **THEN** the route changes to that item's configured semantic workspace URL

### Requirement: Workspace shell hosts tool content
The frontend SHALL render the active workspace item's tool content inside the shared workspace shell and render placeholder content for configured tools without implemented feature content.

#### Scenario: Implemented tool renders feature content
- **WHEN** a user opens `/data-management/steam-game-metadata`
- **THEN** the main workspace area renders the Steam game metadata management tool inside the shared shell

#### Scenario: Unimplemented configured tool renders placeholder content
- **WHEN** a user opens a valid configured workspace item that does not have implemented feature content
- **THEN** the main workspace area renders neutral placeholder content for that item inside the shared shell

### Requirement: Invalid workspace route parameters are rejected
The frontend SHALL reject workspace URLs whose `section` or `item` route parameter is not defined in the workspace navigation config.

#### Scenario: Unknown workspace section is not found
- **WHEN** a user visits `/unknown/steam-game-metadata`
- **THEN** the frontend renders a not-found state

#### Scenario: Unknown workspace item is not found
- **WHEN** a user visits `/data-management/unknown`
- **THEN** the frontend renders a not-found state
