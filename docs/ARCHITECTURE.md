# Architecture

EcoTrack is a single Next.js (App Router) application. It is organised into
three layers with a strict dependency direction: **UI → domain → primitives**.
Nothing in the domain layer depends on React or the browser, which keeps it
pure and fully unit-testable.

## Layers

```
app/                       Routing, layout, metadata, API routes
  layout.tsx               Root layout, fonts, no-flash theme script, <head>
  page.tsx                 Client orchestration (state + lazy result UI)
  api/insights/route.ts    Secure POST endpoint
  manifest.ts/robots.ts/sitemap.ts   SEO + PWA metadata routes

components/                Presentation
  ui/                      Reusable primitives (Button, Card, fields…)
  charts/                  Recharts wrappers (client, code-split)
  *.tsx                    Feature components

lib/                       Domain + utilities (framework-agnostic where possible)
  carbon/                  Emission factors, constants, types, calculator, schema
  insights/                Rule engine, AI client (server-only), prompt, schema
  storage.ts               Validated localStorage layer
  rate-limit.ts            In-memory fixed-window limiter (self-pruning)
  report.ts                Plain-text report builder
  format.ts / cn.ts / site.ts   Small utilities
```

## Request flow: generating insights

```
User submits form
      │
      ▼
calculateFootprint(input)         (pure, lib/carbon/calculator.ts)
      │  result rendered immediately (summary, breakdown)
      ▼
POST /api/insights  ──────────────────────────────────────────┐
      │ 1. body-size guard (413)                               │
      │ 2. rate limit by IP (429)                              │  server
      │ 3. Zod validation (400)                                │  (Node runtime)
      │ 4. isAiConfigured?                                     │
      │       ├─ yes → Gemini (server-only key) → Zod-validate │
      │       │         └─ on error ↘                          │
      │       └─ no  → rule-based engine ◀────────────────────┘
      ▼
InsightsResponse (source: "ai" | "rules")  → rendered as cards
```

## Key design decisions

- **Privacy-first storage.** No accounts or database; history and goals live in
  `localStorage`, validated with Zod on read so corrupted data fails safe.
- **Graceful AI degradation.** The deterministic rule engine guarantees the
  feature works with no key, offline factors, or during an outage.
- **Defence in depth.** Validation runs on the client (UX) _and_ server
  (trust boundary); the AI model's output is also schema-validated.
- **Performance.** Result UI and charts are code-split; pure components are
  memoized; the limiter map is self-pruning.

## Testing strategy

- **Unit:** pure domain logic (calculator, rules, schemas, formatters, storage,
  limiter, report, JSON extraction).
- **Integration:** the API route is tested across all branches (validation,
  limits, AI success, AI failure → fallback).
- **Component + a11y:** React Testing Library plus automated axe checks.
- **Gates:** typecheck, lint, 90%-line coverage, and a production build run in
  CI on every push.
