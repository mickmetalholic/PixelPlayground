## ADDED Requirements

### Requirement: Frontend supports jsdom test environment
The frontend vitest configuration SHALL support two test environments: `node` for server-side logic tests (`*.test.ts`) and `jsdom` for React component tests (`*.test.tsx`). The project MUST NOT regress existing server-side tests when jsdom is added.

#### Scenario: Server-side tests continue using node environment
- **WHEN** vitest runs an existing server-side test file (e.g., `src/server/trpc/context.test.ts`)
- **THEN** the test executes in `node` environment and passes without DOM-related errors

#### Scenario: Component tests execute in jsdom environment
- **WHEN** vitest runs a component test file (e.g., `src/components/ui/button.test.tsx`) that accesses `document` or `window`
- **THEN** the test executes in `jsdom` environment and browser APIs are available

#### Scenario: jsdom module is a direct dependency
- **WHEN** `cat apps/frontend/package.json` is inspected
- **THEN** `jsdom` (or `happy-dom`) appears in `devDependencies`

### Requirement: React Testing Library integration
The frontend SHALL include `@testing-library/react` so that component tests can render React components and query rendered output using accessible queries (`getByRole`, `getByText`, etc.).

#### Scenario: Component rendering in test
- **WHEN** a test file renders a React component via `render(<Component />)` from `@testing-library/react`
- **THEN** the component renders into the jsdom document and queries return DOM elements

#### Scenario: User event simulation
- **WHEN** a test simulates user interaction via `fireEvent.click()` or `userEvent.click()` on a rendered element
- **THEN** the component's event handler executes and the DOM updates accordingly

### Requirement: Custom DOM matchers
The frontend SHALL include `@testing-library/jest-dom` matchers (e.g., `toBeInTheDocument()`, `toHaveTextContent()`) registered via a vitest setup file.

#### Scenario: DOM matchers available in component tests
- **WHEN** a component test asserts `expect(element).toBeInTheDocument()`
- **THEN** the matcher resolves correctly without type errors

#### Scenario: Setup file configured in vitest config
- **WHEN** `grep setupFiles apps/frontend/vitest.config.ts` is run
- **THEN** the config references `./vitest.setup.ts` (or equivalent) in `setupFiles`

### Requirement: Component test file conventions
Component test files SHALL use the `.test.tsx` extension and be co-located with their source components or placed in a `__tests__` subdirectory, following the same conventions as the project's existing test structure.

#### Scenario: Co-located component test
- **WHEN** a component file `src/components/ui/button.tsx` exists
- **THEN** its test file `src/components/ui/button.test.tsx` is discovered by vitest and run in jsdom environment
