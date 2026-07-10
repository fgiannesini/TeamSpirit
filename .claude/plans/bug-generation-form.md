# Bug Generation Form

## Contexte

### Existant — génération bugs

`src/simulate/bug-generator.ts` — 3 implémentations `BugGenerator` deja codees:

- `noBugGenerator` — retourne `[]`
- `RandomBugGenerator(creationRandomProvider, complexityRandomProvider, priorityRandomProvider)` — itere `backlog.userStoriesDone`, applique `shouldGenerateBug` (proba basee sur complexite/experience/temps/reviews)
- `CustomBugGenerator(bugEvents: BugGeneratorEvent[])` — declenche bug a `time` donne, sans dependance US existante

`BugGeneratorEvent`:
```ts
{ complexity: number; reviewComplexity: number; time: number; priority: number }
```

`simulation.ts:32` — boucle appelle `bugGenerator.generate(backlog, team, time)` chaque tick → push events `CreateUserStory` + `ChangePriority` + `addUserStory`.

`form-store.ts:270` — `noBugGenerator` cable en dur dans `runSimulation`. Pas de mode/state/actions cote store.

### Existant — pattern priority-modificator (modele a dupliquer)

Fichiers:
- `src/front/priority-modificator/priority-modificator.vue` — wrapper Selector
- `src/front/priority-modificator/custom-priority-modificator.vue` — liste cartes + empty state + add button
- `src/front/priority-modificator/priority-card.vue` — carte unique (date + selection US + slider priority)
- `src/front/shared/selector.vue` — radio `notSet|random|custom` + slot custom

Store (`form-store.ts`):
- `priorityModificatorMode: SelectorMode` — `'random' | 'custom' | 'notSet'`
- `priorityModificators: PriorityModification[]`
- Actions `generatePriorityModification()` / `removePriorityModification(id)`
- Helper export `toPriorityModificatorEvents(mods, today): PriorityModificatorEvent[]`
- Dans `runSimulation`: switch mode → `noPriorityModificator | new RandomPriorityModificator(rng) | new CustomPriorityModificator(events)`

Nav tab dans `form.vue` — bouton + container `<priority-modificator-tab>` / `<priority-modificator-container>`.

### Differences bug vs priority

- Bug custom card = pas de selection US (bug = nouvelle US creee). Champs: date + complexity + reviewComplexity + priority
- `RandomBugGenerator` = 3 providers random (vs 1 pour priority)
- `BugGeneratorEvent` = 4 champs (vs 3 pour `PriorityModificatorEvent`)

### Types a ajouter dans `form-store.ts`

```ts
export type BugGeneration = {
  id: number;
  date: Date;
  complexity: number;
  reviewComplexity: number;
  priority: number;
};

// State additions
bugGeneratorMode: SelectorMode;     // 'notSet' default
bugGenerations: BugGeneration[];    // [] default
```

Actions: `generateBugGeneration()`, `removeBugGeneration(id)`.

Helper export: `toBugGeneratorEvents(generations: BugGeneration[], today: Date): BugGeneratorEvent[]`.

### Composants a creer

- `src/front/bug-generator/bug-generator.vue` — wrapper Selector
- `src/front/bug-generator/custom-bug-generator.vue` — liste + empty state
- `src/front/bug-generator/bug-card.vue` — carte (date + 3 sliders)

Plus tests jumeaux pour chaque.

### Composants a modifier

- `src/front/form.vue` — ajouter tab `bug-generator-tab` + container
- `src/front/form-store.ts` — types + state + actions + helper + branchement `runSimulation`
- `src/front/front-factory-for-test.ts` — ajouter factory `bugGeneration()`

### Branchement simulation

Dans `runSimulation`:
```ts
const bugGenerator =
  this.bugGeneratorMode === 'random'
    ? new RandomBugGenerator(randomProvider, randomProvider, randomProvider)
    : this.bugGeneratorMode === 'custom'
      ? new CustomBugGenerator(toBugGeneratorEvents(this.bugGenerations, new Date()))
      : noBugGenerator;
// puis remplace argument 3 de simulateFn
```

## Taches

Chaque tache = code + tests ensemble. Verifier apres chacune:
```bash
npm run type-check
npx vitest run <fichier.test.ts>
npm run format
```

### 1. [x] Factory test `bugGeneration`

Fichier: `src/front/front-factory-for-test.ts`

- Ajouter import type `BugGeneration` depuis `form-store.ts`
- Ajouter fonction `bugGeneration(option: Partial<BugGeneration> = {}): BugGeneration` avec defaults `{ id: 0, date: new Date('2025-12-25'), complexity: 3, reviewComplexity: 2, priority: 1 }`

Pas de tests directs — utilise par taches suivantes.

### 2. [x] Store: types + state + actions bugGenerations

Fichiers: `src/front/form-store.ts` + `src/front/form-store.test.ts`

Code:
- Ajouter `export type BugGeneration` (voir Contexte)
- State: ajouter `bugGeneratorMode: SelectorMode` (default `'notSet'`) + `bugGenerations: BugGeneration[]` (default `[]`)
- Update `State` type
- Action `generateBugGeneration()` — push `{ id: nextId(...), date: new Date(), complexity: 3, reviewComplexity: 2, priority: 1 }`
- Action `removeBugGeneration(targetId: number)` — filter par id

Tests (describe `Bug Generations`):
- `should generate a bug generation` — apres `generateBugGeneration()`, state contient `[bugGeneration({ id: 0 })]`
- `should generate two bug generations with ids 0 and 1`
- `should remove the targeted bug generation` — patch 3 items, remove id 1, reste id 0+2
- `should add a bug generation after the last one` — patch id 3, generate, reste id 3+4

Verif:
```bash
npx vitest run src/front/form-store.test.ts
```

### 3. [x] Store: helper `toBugGeneratorEvents`

Fichiers: `src/front/form-store.ts` + `src/front/form-store.test.ts`

Code: exporter
```ts
export const toBugGeneratorEvents = (
  generations: BugGeneration[],
  today: Date,
): BugGeneratorEvent[] =>
  generations.map(({ date, complexity, reviewComplexity, priority }) => ({
    time: Math.max(1, daysBetween(today, date) + 1),
    complexity,
    reviewComplexity,
    priority,
  }));
```

Import `BugGeneratorEvent` depuis `../simulate/bug-generator.ts`.

Tests (describe `toBugGeneratorEvents`):
- `should return empty array when no generations`
- `should convert one generation to one event` — date `2025-12-28`, today `2025-12-25`, complexity 5, reviewComplexity 3, priority 2 → `{ time: 4, complexity: 5, reviewComplexity: 3, priority: 2 }`
- `should produce one event per generation` — 2 generations → 2 events
- `should clamp time to 1 when date is before today`
- `should return time 1 when date equals today`

### 4. [ ] Store: branchement `runSimulation` mode bug-generator

Fichiers: `src/front/form-store.ts` + `src/front/form-store.test.ts`

Code dans `runSimulation`:
```ts
const bugGenerator =
  this.bugGeneratorMode === 'random'
    ? new RandomBugGenerator(randomProvider, randomProvider, randomProvider)
    : this.bugGeneratorMode === 'custom'
      ? new CustomBugGenerator(toBugGeneratorEvents(this.bugGenerations, new Date()))
      : noBugGenerator;
```

Remplacer argument 3 (`noBugGenerator`) de `simulateFn(...)` par `bugGenerator`.

Imports a ajouter: `RandomBugGenerator`, `CustomBugGenerator` depuis `../simulate/bug-generator.ts`.

Tests (dans describe `Simulation`, calques sur tests priority):
- `Should pass noBugGenerator when bugGeneratorMode is notSet` — verifier `toHaveBeenCalledWith(any, any, noBugGenerator, any, any)`
- `Should pass RandomBugGenerator when bugGeneratorMode is random` — patch mode random, passer randomProvider, verifier `expect.any(RandomBugGenerator)`
- `Should pass CustomBugGenerator with events when bugGeneratorMode is custom` — patch mode custom + 1 bugGeneration, verifier `new CustomBugGenerator([{ time: 4, complexity: ..., reviewComplexity: ..., priority: ... }])`

### 5. [ ] Composant `bug-card.vue`

Fichiers: `src/front/bug-generator/bug-card.vue` + `src/front/bug-generator/bug-card.test.ts`

Props:
```ts
{ id: number; date: Date; complexity: number; reviewComplexity: number; priority: number }
```

Emits: `update:date`, `update:complexity`, `update:review-complexity`, `update:priority`, `remove`.

Template:
- `<article class="medium-width">`
- `<nav>` avec `<h4 data-testid=title>Bug {{ id }}</h4>` + `<RemoveButton @click="$emit('remove')" />`
- Date input `[data-testid=date-input]` + label `[data-testid=date-label]` "Date"
- 3 sliders (Slider component): complexity (min 1 max 10), reviewComplexity (min 1 max 10), priority (min 1 max 10) — chacun precede d'un label `[data-testid=*-label]`

Tests calques sur `priority-card.test.ts`:
- `Should render the component`
- `Should render a title with id` — texte `Bug 1`
- `Should have a button to remove the card`
- `Should send a remove event on click on remove button`
- Date: 4 tests (render input, render label, bind value, emit update:date)
- Complexity slider: 4 tests (render, bind value, min 1, max 10, emit update:complexity)
- Review complexity slider: 4 tests idem
- Priority slider: 4 tests idem

Verif:
```bash
npx vitest run src/front/bug-generator/bug-card.test.ts
```

### 6. [ ] Composant `custom-bug-generator.vue`

Fichiers: `src/front/bug-generator/custom-bug-generator.vue` + `src/front/bug-generator/custom-bug-generator.test.ts`

Template calque sur `custom-priority-modificator.vue`:
- `v-if="hasBugGenerations"` setting-state — grid de `BugCard` v-for `bugGeneration in store.bugGenerations`
  - `:data-testid="`bug-generation-${bugGeneration.id}`"`
  - `v-model:date`, `v-model:complexity`, `v-model:review-complexity`, `v-model:priority`
  - `@remove="removeBugGeneration(bugGeneration.id)"`
- `v-else` empty-state `<article>` avec icone `bug_report` + `<h5>No bug generation exists</h5>` + add-button

Script:
- `useFormStore()`
- `addBugGeneration` → `store.generateBugGeneration()`
- `removeBugGeneration(id)` → `store.removeBugGeneration(id)`
- `hasBugGenerations` computed

Tests calques sur `custom-priority-modificator.test.ts`:
- `Should render`
- `Should generate a bug generation in setting state` — clic add → spy `generateBugGeneration`
- `Should display bug generations` — patch 2 items → cards rendues
- `Should remove a bug generation` — trigger remove sur card → spy `removeBugGeneration(0)`
- Events binding:
  - `Should bind date for bug card`
  - `Should update date on emit`
  - `Should bind complexity for bug card`
  - `Should update complexity on emit`
  - `Should bind review-complexity for bug card`
  - `Should update review-complexity on emit`
  - `Should bind priority for bug card`
  - `Should update priority on emit`
- Empty state:
  - `Should render empty state when no bug generations`
  - `Should not display empty state when bug generations exist`
  - `Should have a button to add a bug generation in empty state`
  - `Should not display setting state when no bug generation is added`
  - `Should generate a bug generation in empty state`

### 7. [ ] Composant `bug-generator.vue` (wrapper)

Fichiers: `src/front/bug-generator/bug-generator.vue` + `src/front/bug-generator/bug-generator.test.ts`

Template calque sur `priority-modificator.vue`:
```vue
<Selector v-model:selectedMode="store.bugGeneratorMode" :mandatory="false">
  <CustomBugGenerator />
</Selector>
```

Tests calques sur `priority-modificator.test.ts`:
- `Should render`
- `Should have a selector not selected by default`
- `Should update random mode in store`
- `Should select custom mode`
- `Should select custom mode on loading`
- `Should select random mode on loading`
- `Should render Custom Bug Generator`
- `Should set mode selection not mandatory`

### 8. [ ] Onglet `bug-generator` dans `form.vue`

Fichiers: `src/front/form.vue` + `src/front/form.test.ts`

Code:
- Ajouter `'bug-generator'` au type `TabName`
- Ajouter import `BugGenerator from './bug-generator/bug-generator.vue'`
- Ajouter bouton nav `[data-testid=bug-generator-tab]` + icone `bug_report` + label "Bug Generator"
- Ajouter container `[data-testid=bug-generator-container]` rendering `<BugGenerator />`
- Position recommandee: entre `priority-modificator` et `user-stories`

Tests calques sur `describe('Priority modificator', ...)` dans `form.test.ts`:
- `Should render a navigation bug generator tab`
- `Should have the navigation tab bug generator inactive by default`
- `Should set the navigation tab bug generator active onclick`
- `Should set the bug generator page active on bug generator tab click`
- `Should render a bug generator component`

## Verification par tache

Apres chaque tache:
```bash
npm run type-check                          # aucune erreur TS
npx vitest run <fichier-test-de-la-tache>   # tous tests passent
npm run format                              # formattage
```

A la fin (apres tache 8):
```bash
npm run type-check
npx vitest run
npm run lint
npm run format
```
