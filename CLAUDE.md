# CLAUDE.md

## Commandes

```bash
npm start            # Dev → /TeamSpirit/main
npm run build        # Build → dist/
npm test             # Vitest tous fichiers
npx vitest run src/simulate/engine/simulation.spec.ts  # Test unique
npm run type-check   # vue-tsc
npm run lint         # Oxlint
npm run lint:fix     # Autofix
npm run format       # Oxfmt
```

## Architecture

Simulation équipe logicielle → timeline animée.

**`src/simulate/`** — TS pur, unit-testable, découpé par module métier:

- `team/` — `team.ts`, `user-story.ts`, `review.ts`, `team-modificator.ts`
- `backlog/` — `backlog.ts`, `bug-generator.ts`, `priority-modificator.ts`
- `engine/` — `simulation.ts` (orchestrateur), `simulation-time.ts`, `simulation-structure.ts`, `events.ts`
- `stats/` — `stats.ts`
- `factory.ts` (racine) — helpers construction, transverse (tests + `form-store.ts`)

**`src/front/`** — Vue 3 SFCs (conventions test/composants → `src/front/CLAUDE.md`):

- `router.ts` → routes `/main`, `/simulate`, `/play/:id`
- `form-store.ts` → Pinia state (config + SimulationOutputs)
- `play/` → réactif Vue

**`src/time-sequence/`** — 2e entry Vite (standalone HTML viz), inclut `storage/session-storage.ts`

### Flux données

`Form → form-store → simulate() → SimulationOutputs → sessionStorage → Play/Resume`
