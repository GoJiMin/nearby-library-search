# Project Rules

## Architecture

- This repository uses a `pnpm` workspace monorepo.
- The target app boundaries are `apps/web` for the React client and `apps/bff` for the Fastify BFF.
- The current web app source lives in `apps/web/src`.
- Shared cross-app contracts live in `packages/contracts`.
- This project follows FSD architecture.
- Each layer may contain multiple slices.
- Each slice may include segments such as `ui`, `lib`, and `model` when needed.
- Every slice must expose its public API through an `index.ts` file.
- Place page components under the slice `ui` segment.
- Use the `pages` layer for route-level UI instead of placing page components inside the router slice.
- Do not add barrel exports at the layer root.
- Do not add barrel exports inside each segment directory.
- Do not import from individual files inside a slice from outside that slice.
- Do not export slice members by targeting individual files directly. Use the slice `index.ts` barrel export only.

## Runtime Boundaries

- Web client-exposed environment variables must use the `VITE_` prefix only.
- Keep public web env in `apps/web/.env` and server-only env in `apps/bff/.env`.
- `VITE_API_BASE_URL` must point to the Fastify BFF only.
- Server-only secrets for the BFF must not use the `VITE_` prefix.
- External Open API auth keys must be stored and read only in the BFF runtime environment.
- Do not access `import.meta.env` directly in components, pages, features, entities, or shared UI code.
- Read client runtime configuration through the `@/shared/env` slice only.
- `entities`, `features`, and `pages` must not call `fetch` directly for application API requests.
- Route application API requests through the public API exposed by the `@/shared/request` slice only.
- `@/shared/request` must target the Fastify BFF `/api` namespace only.
- The web app must not call external provider Open APIs directly once the BFF is introduced.
- Route provider API traffic through the Fastify BFF only.
- Import reusable UI primitives through `@/shared/ui` only.
- Do not import files directly from inside `src/shared/ui`.
- The `shared` layer must not contain domain-specific business knowledge.
- Keep `shared` limited to reusable primitives, platform rules, and cross-domain utilities.

## Testing

- The standard test stack is `vitest` and `react testing library`.
- Do not write isolated unit tests for every file by default.
- Avoid unnecessary tests that do not improve confidence in user-facing behavior.
- Prefer integration tests organized around user-visible features and flows.
- In integration tests, use accessibility-first queries such as `getByRole`, `getByLabelText`, and similar Testing Library queries.
- Add focused unit tests only when complex UI branching or pure logic needs detailed verification.
- Use unit tests to cover edge cases, failure cases, and error-handling paths when integration tests alone are not sufficient.
- For Fastify BFF routes, prefer `createApp().inject()` based integration tests over port-bound server tests.
- Mock external Open API calls at the `requestLibraryApi` boundary in BFF tests.

## Styling

- Prefer Tailwind's canonical utility classes over arbitrary values whenever an equivalent scale utility exists.
- For example, use `rounded-3xl` instead of `rounded-[24px]`, and `min-w-55` instead of `min-w-[220px]`.
- Use arbitrary values only when there is no meaningful built-in utility or project token for the value.
- `calc(...)`, custom shadows, or one-off visual adjustments without an equivalent scale utility are acceptable exceptions.

## Workflow Rules

### Git

- Commit titles must be explicit enough that anyone can understand the purpose of the change from the title alone.
- Avoid vague titles such as phase-only summaries or generic dependency updates without user-facing meaning.

### UI/UX Source of Truth

- Phase 5 and later UI/UX implementation must always reference `docs/phases/phase-04-2-ux-ui-design/spec.md` first.
- Treat that document as the implementation contract for screen structure, interaction, state handling, responsive behavior, accessibility, theme, and motion until a later approved spec explicitly supersedes it.

### Skill Enforcement

- Treat `impeccable` as a design operating model, not as a single standalone skill.
- The primary design context source of truth is the root `.impeccable.md` file.
- For design implementation work, use `frontend-design` as the base skill and pair it with the relevant design skills for the task.
- Use the following impeccable skill families proactively when the task matches:
- Layout and hierarchy: `arrange`, `distill`, `normalize`, `extract`
- Typography and copy: `typeset`, `clarify`
- Responsive and resilience: `adapt`, `harden`
- Motion and personality: `animate`, `delight`, `bolder`, `quieter`, `colorize`, `overdrive`
- Review and finish: `audit`, `critique`, `polish`
- Onboarding and empty states: `onboard`
- UI performance: `optimize`
- Use `teach-impeccable` only when the design context is missing or needs to be refreshed.
- For React component architecture, state design, refactoring, data flow, or performance work, actively use `vercel-react-best-practices`.
- For substantial implementation, design, review, refactor, or audit work, proactively identify and use relevant skills instead of waiting for the user to name them.

### Component Design

- Write test-friendly code with clear state boundaries, explicit props, and user-visible behavior that can be verified through RTL queries.
- Do not let a single component own too many responsibilities such as data loading, complex state orchestration, large layout composition, and detailed interaction logic all at once.
- Split files or components when responsibility, reuse potential, or testability clearly improves.
- Do not split files only for ceremony; keep related logic together when extra indirection does not improve clarity.

## Design Context

- The root `.impeccable.md` file is the primary design context source of truth.
- This section is a working mirror for implementation rules and quick reference.
- If this section and `.impeccable.md` ever conflict, follow `.impeccable.md` and then sync this file.

### Users

- The primary users are general neighborhood residents, people interested in reading, and university students.
- Their main job is to quickly find a nearby library that currently holds the book they want.
- Usage is likely short-session and task-oriented, so screens should be immediately understandable and action-forward.

### Brand Personality

- The product should feel game-like, easy to use, and simple.
- The interface should communicate calmness and speed while still feeling distinctive.
- It should avoid both institutional stiffness and generic utility-app blandness.

### Aesthetic Direction

- Use Toss- and Karrot-level UX clarity as a reference for ease of use, while maintaining a cleaner and more distinctive visual identity.
- Support both light mode and dark mode.
- Avoid uncontrolled gradients and purple-heavy palettes.
- Avoid rigid public-service aesthetics, card-within-card AI-style layouts, and inconsistent typography or spacing between screens.
- Preserve a stable visual system with clear hierarchy, rounded surfaces, and restrained but memorable accents.

### Design Principles

- Make the first action obvious and immediate so users can start searching without hesitation.
- Build on a calm foundation, then add a small number of distinctive visual moments instead of constant visual noise.
- Treat consistency in typography, spacing, density, and feedback as a core quality requirement.
- Let flows feel light and game-like, but keep information architecture and interaction patterns unambiguous.
- Treat accessibility as a default: follow WCAG principles, maintain strong contrast, clear focus states, light/dark readiness, and avoid unnecessary motion.
