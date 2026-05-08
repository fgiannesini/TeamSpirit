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

### Process itératif

Toute tâche multi-étapes ou bug suit ce cycle :

1. **`thinker`** — explore code, identifie cause racine, écrit `.claude/plans/<nom>.md` avec tâches atomiques
2. **Implémentation** (Claude) — code + tests ensemble, tâche par tâche selon plan
3. **`reviewer`** — vérifie: code vs plan, couverture tests cas fonctionnels, style, archi
4. **Correction** (Claude) — corrige les findings `BLOQUE` et `IMPORTANT`
5. **`reviewer`** — re-vérifie jusqu'à RAS ou MINEUR uniquement
6. Tâche suivante → retour étape 2

### Agents

| Agent | Modèle | Rôle |
|---|---|---|
| `thinker` | Opus | Planification, analyse bugs |
| `reviewer` | Sonnet | Review code/tests/style/archi |
| `cavecrew-investigator` | Haiku | Recherches fichiers/symboles |
| `cavecrew-builder` | Sonnet | Édits code 1-2 fichiers |
| `cavecrew-clerk` | Haiku | Édits markdown/plans/delete |

`.claude/agents/*.md` → style **caveman** obligatoire :
- Supprimer articles, auxiliaires, prépositions superflues
- Listes > phrases complètes
- Blocs code + chemins intacts

### Craft

**4 règles du design simple (Kent Beck — ordre priorité)**
1. Tests passent
2. Révèle intention — noms explicites, pas de commentaires explicatifs nécessaires
3. Pas de duplication — DRY sur connaissance, pas sur syntaxe
4. Éléments minimaux — YAGNI, supprimer tout ce qui ne sert pas

**Boy Scout Rule** — laisser chaque fichier touché plus propre qu'à l'arrivée.

**SOLID**
- SRP: une seule raison de changer par fonction/classe/composant
- OCP: étendre sans modifier (composition, pas héritage)
- DIP: dépendre d'abstractions, injecter dépendances concrètes

**Clean Code**
- Fonction fait une seule chose, courte
- Nommage révèle intention (variable, fonction, type)
- Pas de code mort, pas de commentaires qui expliquent le quoi

### Style code

- Format: **Oxfmt** — quotes simples, indent 2 espaces.
- Lint: **Oxlint** plugins Vue+TS+Vitest (`.oxlintrc.json`).
- TS strict: pas vars/params inutilisés, pas fallthrough switch.
- Style: **BeerCSS** (Material Design 3) + Sass.
- CSS: chercher classe BeerCSS en premier via docs `https://www.beercss.com` (WebFetch) avant tout style inline. Fallback inline seulement si aucune classe existante.
- Commentaires+UI strings en français.
