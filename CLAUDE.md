# CLAUDE.md

## TypeScript Rules

- Do not use `any` type. Use `unknown` instead.
- Do not use type conversions with `as`.

## Performance
- Each acorn walk is expensive, so we merge them into a single walk using mergeVisitors

## Common rules
- After changes fix/add tests and run all tests
- After change run yarn typecheck