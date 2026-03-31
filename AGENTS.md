# Project Rules

## Architecture
- This project follows FSD architecture.
- Each layer may contain multiple slices.
- Every slice must expose its public API through an `index.ts` file.
- Do not import from individual files inside a slice from outside that slice.
- Do not export slice members by targeting individual files directly. Use the slice `index.ts` barrel export only.

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
