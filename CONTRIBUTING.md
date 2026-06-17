# Contributing to EcoTrack

Thanks for your interest in improving EcoTrack! This guide explains the
conventions and quality gates the project follows.

## Project layout

```
app/        Routing, layout, API routes (Next.js App Router)
components/  UI components (ui/ holds reusable primitives)
lib/         Framework-agnostic domain logic, utilities, and hooks
test/        Test-only stubs
types/       Ambient type declarations
```

## Conventions

- **TypeScript, strict mode.** No `any`; prefer precise types and
  `import type` for type-only imports.
- **Pure domain logic.** Anything in `lib/carbon` and `lib/insights` (except the
  server-only AI client) must be free of DOM/network/storage side effects so it
  stays unit-testable.
- **Single source of truth.** Shared constants live in
  `lib/carbon/constants.ts`; emission factors live in `lib/carbon/factors.ts`
  with inline citations.
- **Accessibility first.** Components use semantic HTML, associate labels,
  expose state to assistive tech, and provide text alternatives for any chart.
- **Formatting** is handled by Prettier (`.prettierrc.json`). Run
  `npm run format` before committing.

## Quality gates

Every change must pass the same checks CI runs:

```bash
npm run typecheck      # tsc --noEmit
npm run lint           # next lint
npm run test:coverage  # vitest + 90% coverage gate on core logic
npm run build          # production build
```

Add or update tests for any behavioural change. New domain logic should ship
with unit tests; new components should include an accessibility (axe) check.

## Commit style

Use concise, conventional-style messages, e.g.:

- `feat: add commute estimator`
- `fix: prune expired rate-limit windows`
- `docs: document Gemini prompt`
- `test: cover AI fallback path`
