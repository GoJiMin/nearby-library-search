# Project Rules

## Architecture

- This project follows FSD architecture.
- Each layer may contain multiple slices.
- Each slice may include segments such as `ui`, `lib`, and `model` when needed.
- Every slice must expose its public API through an `index.ts` file.
- Place page components under the slice `ui` segment.
- Do not add barrel exports at the layer root.
- Do not add barrel exports inside each segment directory.
- Do not import from individual files inside a slice from outside that slice.
- Do not export slice members by targeting individual files directly. Use the slice `index.ts` barrel export only.
- Use the `pages` layer for route-level UI instead of placing page components inside the router slice.
- Split files only when a file has too many responsibilities or when reuse is likely enough to justify the extra file.
- If those conditions are not met, keep related logic together in a single file.

## Git

- Commit titles must be explicit enough that anyone can understand the purpose of the change from the title alone.
- Avoid vague titles such as phase-only summaries or generic dependency updates without user-facing meaning.

## Testing

- The standard test stack is `vitest` and `react testing library`.
- Do not write isolated unit tests for every file by default.
- Avoid unnecessary tests that do not improve confidence in user-facing behavior.
- Prefer integration tests organized around user-visible features and flows.
- In integration tests, use accessibility-first queries such as `getByRole`, `getByLabelText`, and similar Testing Library queries.
- Add focused unit tests only when complex UI branching or pure logic needs detailed verification.
- Use unit tests to cover edge cases, failure cases, and error-handling paths when integration tests alone are not sufficient.

## Configuration

- Client-exposed environment variables must use the `VITE_` prefix only.
- Do not access `import.meta.env` directly in components, pages, features, entities, or shared UI code.
- Read client env values through the `@/shared/env` slice only.

## Shared Layer

- `entities`, `features`, and `pages` must not call `fetch` directly for application API requests.
- Route application API requests through the public API exposed by the `@/shared/request` slice only.
- `entities`, `features`, and `pages` must not access `import.meta.env` directly.
- Read client runtime configuration through `@/shared/env` only.
- Import reusable UI primitives through `@/shared/ui` only.
- Do not import files directly from inside `src/shared/ui`.
- The `shared` layer must not contain domain-specific business knowledge.
- Keep `shared` limited to reusable primitives, platform rules, and cross-domain utilities.

## Styling

- Prefer Tailwind's canonical utility classes over arbitrary values whenever an equivalent scale utility exists.
- For example, use `rounded-3xl` instead of `rounded-[24px]`, and `min-w-55` instead of `min-w-[220px]`.
- Use arbitrary values only when there is no meaningful built-in utility or project token for the value.
- `calc(...)`, custom shadows, or one-off visual adjustments without an equivalent scale utility are acceptable exceptions.
