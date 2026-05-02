# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server (opens at /TeamSpirit/main)
npm run build      # Production build → dist/
npm test           # Run all tests (Vitest)
npm run type-check # Vue-aware TypeScript check (vue-tsc)
npm run lint       # Oxlint static analysis
npm run lint:fix   # Oxlint with auto-fix
npm run format     # Oxfmt formatter
npm run format:check # Check formatting without writing
```

Run a single test file:
```bash
npx vitest run src/simulate/simulation.test.ts
```

Run tests matching a name pattern:
```bash
npx vitest run --reporter=verbose -t "pattern"
```

## Architecture

TeamSpirit simulates software team dynamics — sprint execution, code review workflows, priority shifts, team availability — and visualizes the resulting timelines.

### Layer separation

**`src/simulate/`** — pure TypeScript domain engine with no Vue dependencies. Fully unit-testable.
- `simulation.ts` — main loop: advances time, calls team/backlog/bug/priority/team-modificator
- `team.ts` — `ParallelTeam` / `EnsembleTeam` models
- `user-story.ts` — task state machine (todo → in-progress → review → done)
- `backlog.ts`, `review.ts`, `events.ts`, `stats.ts` — supporting domain models
- `factory.ts` — test and production object constructors

**`src/front/`** — Vue 3 SFCs organized by feature (form, play, simulation, resume, team, user-stories, reviewers, shared).
- `router.ts` — three routes: `/main` (Form), `/simulate` (Simulation), `/play/:id` (Play)
- `form-store.ts` — Pinia store holding all configuration state and `SimulationOutputs[]`

**`src/flow/`** — legacy imperative DOM code (uses `document.querySelector`); being migrated away from.

**`src/time-sequence/`** — second Vite entry point, standalone HTML visualization utility.

### Data flow

`Form → form-store (Pinia) → simulate() → SimulationOutputs → sessionStorage → Play/Resume`

The simulation runs in `form-store.ts`, stores `timeEvents` + `structureEvents` + `statEvents`, and the Play view reads them back to animate the timeline.

### Vite config specifics

`vite.config.ts` sets `root: './src'`, so all paths in config are relative to `src/`. Two build inputs: `src/main.html` and `src/time-sequence/time-sequence.html`.

### Testing

Tests use **Vitest** with `globals: true` and `jsdom` environment (setup in `src/test-setup.ts`).

Component tests (`play.test.ts`) use `shallowMount` + `createTestingPinia`. Because `shallowMount` creates a detached component, **`document.querySelector` does not work** inside `play.vue` tests — all DOM queries must go through Vue reactive state and `wrapper.find('[data-testid=...]')`.

`flow.test.ts` mounts a real HTML file in jsdom, so `document.querySelector` works there.

**Timing pattern in play.test.ts:**
- Vue mutations from `trigger('click')` are synchronous — check state immediately after, no timer advance needed for the first event's effect.
- Use `advanceTimersToNextTimerAsync` between events at the same time step.
- Use `runAllTimersAsync` to reach final state after all events.

### play.vue reactive model

`play.vue` is fully reactive (no `document.querySelector`):
- `threads: ThreadVue[]` — each has `userStories: UserStoryVue[]`
- `backlogStories: UserStoryVue[]` and `doneStories: UserStoryVue[]`
- `UserStoryVue.testId` — `user-story-{id}` (backlog/done) or `user-story-{id}-{threadId}` (in thread)

### Code style

- Formatter: **Oxfmt** — single quotes, 2-space indentation.
- Linter: **Oxlint** with Vue, TypeScript, and Vitest plugins (`.oxlintrc.json`).
- TypeScript: strict mode — no unused variables/parameters, no fallthrough in switches.
- Styling: **BeerCSS** (Material Design 3) + Sass.
- Some comments and UI strings are in French.
