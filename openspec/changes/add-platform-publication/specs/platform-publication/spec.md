## ADDED Requirements

### Requirement: PlatformPublication shared contract
The system SHALL model platform publications as backend-owned records with a per-platform content shape, referencing a parent pool (NewsCycle) and tracking pipeline progress through a shared PipelineNode sequence.

#### Scenario: Publication contains required fields
- **WHEN** a platform publication is returned by the system
- **THEN** it includes `id`, `newsCycleId`, `platform`, `status`, `selectedDiscountEventIds`, `content`, `publishedUrl`, `createdAt`, and `updatedAt`

#### Scenario: Platform discriminates content shape
- **WHEN** a publication has `platform: 'xiaoheihe'`
- **THEN** `content` conforms to the 小黑盒 content shape (title, summary, body)
- **WHEN** a publication has `platform: 'xiaohongshu'`
- **THEN** `content` conforms to the 小红书 content shape (title, summary, body, coverImage, tags)

#### Scenario: Platform is constrained
- **WHEN** a platform publication is returned by the system
- **THEN** `platform` is one of `xiaoheihe` or `xiaohongshu`, extensible via the discriminated union

#### Scenario: Status is a pipeline node
- **WHEN** a platform publication is returned by the system
- **THEN** `status` is a valid `PipelineNode` value for that publication's platform pipeline, not a standalone status enum

#### Scenario: Selected events are subset of parent pool
- **WHEN** a platform publication is created from a pool
- **THEN** its `selectedDiscountEventIds` must be a subset of the parent pool's `selectedDiscountEventIds`

### Requirement: Pipeline node type and per-platform configuration
The system SHALL define a shared `PipelineNode` union type and per-platform `PLATFORM_PIPELINES` configuration that frontend, backend, and LangGraph all consume.

#### Scenario: Pipeline nodes are shared
- **WHEN** any layer (frontend, backend, LangGraph) imports the pipeline types
- **THEN** the same `PipelineNode` union and `PLATFORM_PIPELINES` mapping are available from `packages/api`

#### Scenario: Platform pipeline is an ordered sequence
- **WHEN** a platform's pipeline is queried
- **THEN** `PLATFORM_PIPELINES[platform]` returns an ordered array of `PipelineNode` values specific to that platform

#### Scenario: Pipeline includes terminal and human nodes
- **WHEN** a pipeline node is evaluated
- **THEN** helper functions `isTerminalNode(node)` and `isHumanNode(node)` return correct results based on the type definition, and `nextNode(platform, current)` returns the next node in sequence or null for terminal nodes

#### Scenario: Pipeline nodes are placeholders
- **WHEN** this change is implemented
- **THEN** pipeline node values are defined as placeholder types — no LangGraph execution, no real publish logic, no AI content generation is implemented at this stage

### Requirement: Backend platform publication base module
The system SHALL provide a Nest backend `GameDiscountPlatformBaseModule` that owns PlatformPublication CRUD, status transition, and candidate-subset validation, shared by all platform-specific modules.

#### Scenario: Base module stores publications
- **WHEN** a platform publication is created, listed, or updated
- **THEN** the base module handles the common CRUD operations regardless of platform

#### Scenario: Base module validates transitions
- **WHEN** a caller requests a status transition via the base module's `transition()` method
- **THEN** the method validates that the target node is reachable from the current node for the publication's platform pipeline, and rejects invalid transitions

#### Scenario: Auto-creation when pool becomes ready
- **WHEN** a pool transitions to `ready` status
- **THEN** the system automatically creates a `PlatformPublication` for each active platform, with `selectedDiscountEventIds` inherited from the pool and `status` set to the first node in the platform's pipeline

#### Scenario: Unpublished pool query excludes published publications
- **WHEN** querying for the next unpublished pool for a given platform
- **THEN** the system returns the most recent `ready` pool whose event IDs are not already covered by a `published` publication for that platform

### Requirement: Per-platform backend modules
The system SHALL provide per-platform NestJS modules that implement a `PlatformPublisher` interface for platform-specific behavior, with placeholder implementations in this change.

#### Scenario: Platform module implements publisher interface
- **WHEN** a platform module is registered
- **THEN** it exports a provider satisfying the `PlatformPublisher` interface (with `validateFormat` and `publish` methods returning placeholder results)

#### Scenario: New platform requires only a new module
- **WHEN** a new platform is added in a future change
- **THEN** only a new module implementing `PlatformPublisher` is required — the base module, tRPC procedures, and frontend list view require no structural changes

#### Scenario: Placeholder publish returns stub
- **WHEN** a platform's `publish` method is called in this change
- **THEN** it returns a typed placeholder result without calling any external API

### Requirement: tRPC publication procedures
The system SHALL expose platform publication procedures through the Nest backend tRPC endpoint for frontend and automation callers.

#### Scenario: List publications for a pool
- **WHEN** a caller requests publications filtered by `newsCycleId`
- **THEN** the system returns all platform publications associated with that pool

#### Scenario: Update publication selected events
- **WHEN** a caller updates a publication's `selectedDiscountEventIds`
- **THEN** the system validates the subset constraint against the parent pool and persists the update

#### Scenario: Transition publication status
- **WHEN** a caller invokes the `transition` procedure
- **THEN** the system validates the target node against the platform's pipeline and updates the publication status

### Requirement: Platform publication frontend workspace
The frontend SHALL display platform publication progress and content detail using a sub-route under the existing content-production workspace.

#### Scenario: Publication appears in pool context
- **WHEN** the user views a ready pool
- **THEN** the UI shows associated platform publications with their current pipeline node

#### Scenario: Publication detail sub-route
- **WHEN** the user clicks a platform publication
- **THEN** the system navigates to a sub-route showing the publication's content, pipeline progress, and selected discount events

#### Scenario: Pipeline progress is visible
- **WHEN** the publication detail view is open
- **THEN** the UI renders the platform's pipeline node sequence with the current node highlighted, using the shared `PLATFORM_PIPELINES` configuration

#### Scenario: Content editing is not available for terminal nodes
- **WHEN** a publication has reached a terminal node (`published` or `failed`)
- **THEN** the UI disables content editing for that publication's form fields
