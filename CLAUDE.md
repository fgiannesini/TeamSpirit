# CLAUDE.md

## Commandes

```bash
npm start            # Dev → /TeamSpirit/main
npm run build        # Build → dist/
npm test             # Vitest
npm run type-check   # vue-tsc
npm run lint         # Oxlint
npm run lint:fix     # Oxlint autofix
npm run format       # Oxfmt
npm run format:check # Vérif format
```

Test unique:
```bash
npx vitest run src/simulate/simulation.test.ts
```

Par nom:
```bash
npx vitest run --reporter=verbose -t "pattern"
```

## Architecture

Simulation dynamiques équipe logicielle → timeline animée.

### Couches

**`src/simulate/`** — TS pur, sans Vue, unit-testable.
- `simulation.ts` — boucle: temps+équipe+backlog+bugs+priorité
- `team.ts` — `ParallelTeam` / `EnsembleTeam`
- `user-story.ts` — machine état: todo→in-progress→review→done
- `backlog.ts`, `review.ts`, `events.ts`, `stats.ts` — domaine
- `factory.ts` — constructeurs test+prod

**`src/front/`** — Vue 3 SFCs par feature (form, play, simulation, resume, team, user-stories, reviewers, shared).
- `router.ts` — routes: `/main`, `/simulate`, `/play/:id`
- `form-store.ts` — Pinia: config + `SimulationOutputs[]`

**`src/flow/`** — DOM impératif legacy (`document.querySelector`); migration en cours.

**`src/time-sequence/`** — 2e entry Vite, visu HTML standalone.

### Flux données

`Form → form-store → simulate() → SimulationOutputs → sessionStorage → Play/Resume`

`form-store.ts` stocke `timeEvents`+`structureEvents`+`statEvents`; Play anime depuis ces données.

### Vite

`vite.config.ts`: `root:'./src'`, chemins relatifs à `src/`. Inputs: `src/main.html` + `src/time-sequence/time-sequence.html`.

### Tests

Vitest, `globals:true`, env jsdom, setup `src/test-setup.ts`.

`play.test.ts`: `shallowMount`+`createTestingPinia`. Composant détaché → **`document.querySelector` ne fonctionne pas** → queries via état réactif Vue + `wrapper.find('[data-testid=...]')`.

`flow.test.ts`: HTML réel dans jsdom → `document.querySelector` OK.

**Timing play.test.ts:**
- `trigger('click')` synchrone → vérifier état immédiatement.
- Même time step → `advanceTimersToNextTimerAsync`.
- État final → `runAllTimersAsync`.

### Modèle réactif play.vue

`play.vue` 100% réactif, pas `document.querySelector`:
- `threads: ThreadVue[]` → chacun a `userStories: UserStoryVue[]`
- `backlogStories: UserStoryVue[]`, `doneStories: UserStoryVue[]`
- `UserStoryVue.testId` — `user-story-{id}` (backlog/done) ou `user-story-{id}-{threadId}` (thread)

### Fichiers config IA

`.claude/agents/*.md` → style **caveman** obligatoire :
- Supprimer articles, auxiliaires, prépositions superflues
- Listes > phrases complètes
- Blocs code + chemins intacts

### Style code

- Format: **Oxfmt** — quotes simples, indent 2 espaces.
- Lint: **Oxlint** plugins Vue+TS+Vitest (`.oxlintrc.json`).
- TS strict: pas vars/params inutilisés, pas fallthrough switch.
- Style: **BeerCSS** (Material Design 3) + Sass.
- Commentaires+UI strings en français.
