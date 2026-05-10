# Priority Modificator — formulaire + store

## Contexte

### État actuel

- `src/simulate/priority-modificator.ts` expose : `PriorityModificator`, `noPriorityModificator`, `RandomPriorityModificator`, `CustomPriorityModificator`, type `PriorityModificatorEvent = { time: number; id: number; priority: number }`.
- `src/simulate/simulation.ts` accepte `priorityModificator: PriorityModificator` en 5e param.
- `src/front/form-store.ts` :
  - state n'a pas `priorityModificatorMode` ni `priorityModificators`.
  - `runSimulation` passe `noPriorityModificator` en dur.
  - pattern team modificator déjà câblé (`teamModificatorMode`, `teamModificators`, `toTeamModificatorEvents`, injection conditionnelle `Random` / `Custom` / `no`).
- `src/front/team-modificator/` : 3 SFCs (`team-modificator.vue` selector wrapper, `custom-team-modificator.vue` liste, `period-card.vue` carte unitaire).
- `src/front/form.vue` : 4 onglets (team, reviewers, team-modificator, user-stories).
- `src/front/front-factory-for-test.ts` : factories `developer`, `teamModification`, `userStory`.

### Manque

1. State store : `priorityModificatorMode`, `priorityModificators`.
2. Actions : `generatePriorityModification`, `removePriorityModification`.
3. Convertisseur : `toPriorityModificatorEvents(modifications, today) -> PriorityModificatorEvent[]`.
4. Injection conditionnelle dans `runSimulation` (`Random` / `Custom` / `no`).
5. UI : dossier `src/front/priority-modificator/` avec 3 SFCs (selector, liste custom, carte unitaire).
6. Onglet 5 dans `form.vue` + tests.
7. Factory test `priorityModification`.

### Stratégie

- Modèle `PriorityModification` symétrique à `TeamModification` :
  - `id: number`
  - `date: Date` — point unique (pas période, événement priorité = instant)
  - `selectedUserStories: UserStory[]` — multi-sélection comme `selectedDevelopers`
  - `priority: number` — valeur cible 1-10 (slider)
- Une `PriorityModification` produit N events : 1 par user story sélectionnée, tous au même `time`.
- Conversion `date -> time` : `Math.max(1, daysBetween(today, date) + 1)` (même logique que `team-modificator`).
- Mode `random` instancie `RandomPriorityModificator(randomProvider)`.
- Mode `custom` instancie `CustomPriorityModificator(toPriorityModificatorEvents(...))`.
- Mode `notSet` injecte `noPriorityModificator`.
- Réutiliser `Selector` partagé (mandatory: false).
- Réutiliser `Slider` partagé pour priorité.
- Carte unitaire = nouveau composant `priority-card.vue` (date + multi-select user stories + slider priorité).

### Cause racine du gap

Pas de bug — fonctionnalité absente. Code simulation déjà prêt ; manque uniquement câblage UI + store.

## Tâches

### 1. Étendre state store + actions

**Fichiers** :
- `src/front/form-store.ts`
- `src/front/form-store.test.ts`
- `src/front/front-factory-for-test.ts`

**Code** :
- Ajouter type :
  ```ts
  export type PriorityModification = {
    id: number;
    date: Date;
    selectedUserStories: UserStory[];
    priority: number;
  };
  ```
- Étendre `State` :
  - `priorityModificatorMode: SelectorMode`
  - `priorityModificators: PriorityModification[]`
- Initialiser : `priorityModificatorMode: 'notSet'`, `priorityModificators: []`.
- Actions :
  - `generatePriorityModification()` — push avec `id = max+1` ou `0`, `date: new Date()`, `selectedUserStories: []`, `priority: 1`.
  - `removePriorityModification(targetId)` — filter id.
- Factory test `priorityModification` (Partial pattern) avec defaults : `id: 0, date: new Date('2025-12-25'), selectedUserStories: [], priority: 1`.

**Tests** (form-store.test.ts, suite `Priority Modifications`) :
- generate ajoute item id 0
- generate deux fois donne ids 0 et 1
- remove filtre l'id ciblé
- generate après state custom respecte max+1

**Vérification** :
```
npm run type-check
npx vitest run src/front/form-store.test.ts
```

### 2. Convertisseur `toPriorityModificatorEvents`

**Fichiers** :
- `src/front/form-store.ts`
- `src/front/form-store.test.ts`

**Code** :
```ts
export const toPriorityModificatorEvents = (
  modifications: PriorityModification[],
  today: Date,
): PriorityModificatorEvent[] =>
  modifications.flatMap(({ date, selectedUserStories, priority }) =>
    selectedUserStories.map((userStory) => ({
      time: Math.max(1, daysBetween(today, date) + 1),
      id: userStory.id,
      priority,
    })),
  );
```
Importer `PriorityModificatorEvent` depuis `priority-modificator.ts`.

**Tests** (suite `toPriorityModificatorEvents`) :
- vide -> `[]`
- modification sans user stories -> `[]`
- 1 modification 1 user story -> 1 event avec time correct
- 1 modification N user stories -> N events
- N modifications -> aplatissement
- date avant today -> time clamp à 1
- date == today -> time = 1

**Vérification** :
```
npm run type-check
npx vitest run src/front/form-store.test.ts
```

### 3. Injection priorityModificator dans `runSimulation`

**Fichiers** :
- `src/front/form-store.ts`
- `src/front/form-store.test.ts`

**Code** :
- Importer `RandomPriorityModificator`, `CustomPriorityModificator` depuis `priority-modificator.ts`.
- Dans `runSimulation`, après calcul `teamModificator`, calculer `priorityModificator` :
  ```ts
  const priorityModificator =
    this.priorityModificatorMode === 'random'
      ? new RandomPriorityModificator(randomProvider)
      : this.priorityModificatorMode === 'custom'
        ? new CustomPriorityModificator(toPriorityModificatorEvents(this.priorityModificators, new Date()))
        : noPriorityModificator;
  ```
- Passer `priorityModificator` au lieu de `noPriorityModificator` dans `simulateFn(...)`.

**Tests** (suite `Simulation`) :
- mode `notSet` -> `noPriorityModificator` passé
- mode `random` -> instance `RandomPriorityModificator` passée
- mode `custom` avec modifications -> `CustomPriorityModificator` avec events corrects passé

**Vérification** :
```
npm run type-check
npx vitest run src/front/form-store.test.ts
```

### 4. Composant `priority-card.vue`

**Fichiers** :
- `src/front/priority-modificator/priority-card.vue` (nouveau)
- `src/front/priority-modificator/priority-card.test.ts` (nouveau)

**Code** (props/emits) :
- props : `id: number`, `date: Date`, `userStories: UserStory[]`, `selectedUserStories: UserStory[]`, `priority: number`
- emits : `update:date`, `update:selected-user-stories`, `update:priority`, `remove`
- Template :
  - titre `Priority change {{ id }}`
  - bouton remove
  - select multi user stories (pattern de `period-card.vue` adapté : `User story {id} - prio {priority}`)
  - chips selected (testids `us-selected-button-{id}`, `us-selected-label-{id}`)
  - input date unique (testid `date-input`, label `date-label` "Date")
  - slider priorité (réutiliser `Slider`, testid `priority-slider`, min 1 max 10)

**Tests** (priority-card.test.ts) :
- render
- titre `Priority change 1` quand `id=1`
- emit `remove` au clic remove-button
- date : input présent, value bindée, emit `update:date` avec `Date`
- user stories : default option, items, emit `update:selected-user-stories` au clic, chips affichés, items sélectionnés cachés du select, emit deselect
- priority : slider présent, valeur bindée, emit `update:priority` avec nouvelle valeur

**Vérification** :
```
npm run type-check
npx vitest run src/front/priority-modificator/priority-card.test.ts
```

### 5. Composant `custom-priority-modificator.vue`

**Fichiers** :
- `src/front/priority-modificator/custom-priority-modificator.vue` (nouveau)
- `src/front/priority-modificator/custom-priority-modificator.test.ts` (nouveau)

**Code** (calque `custom-team-modificator.vue`) :
- empty-state si `store.priorityModificators.length === 0` : icône `priority_high`, texte "No priority modification exists", bouton add.
- setting-state sinon : grid de `PriorityCard` avec `data-testid="priority-modificator-{id}"`.
- props bindings : `:id`, `:userStories="store.userStories"`, `v-model:date`, `v-model:selectedUserStories`, `v-model:priority`, `@remove`.
- handlers : `addPriorityModificator -> store.generatePriorityModification()`, `removePriorityModificator(id) -> store.removePriorityModification(id)`.

**Tests** (calquer `custom-team-modificator.test.ts`) :
- render
- generate appelé au clic add-button (setting-state + empty-state)
- affiche cartes par id
- remove appelé sur event `remove`
- bind `userStories` (depuis store)
- bind `selectedUserStories`
- update selected user stories sur emit
- bind date
- update date sur emit
- bind priority
- update priority sur emit
- empty-state visible quand vide
- setting-state masqué quand vide
- add-button visible en empty-state

**Vérification** :
```
npm run type-check
npx vitest run src/front/priority-modificator/custom-priority-modificator.test.ts
```

### 6. Composant `priority-modificator.vue` (selector wrapper)

**Fichiers** :
- `src/front/priority-modificator/priority-modificator.vue` (nouveau)
- `src/front/priority-modificator/priority-modificator.test.ts` (nouveau)

**Code** (calque `team-modificator.vue`) :
```vue
<script setup lang="ts">
import { useFormStore } from '../form-store.ts';
import Selector from '../shared/selector.vue';
import CustomPriorityModificator from './custom-priority-modificator.vue';

const store = useFormStore();
</script>
<template>
  <Selector v-model:selectedMode="store.priorityModificatorMode" :mandatory="false">
    <CustomPriorityModificator />
  </Selector>
</template>
```

**Tests** (calquer `team-modificator.test.ts`) :
- render
- selector `notSet` par défaut
- update store sur `random`
- update store sur `custom`
- selector reflète `custom` au chargement
- selector reflète `random` au chargement
- rend `CustomPriorityModificator` quand custom
- selector mandatory: false

**Vérification** :
```
npm run type-check
npx vitest run src/front/priority-modificator/priority-modificator.test.ts
```

### 7. Onglet `priority-modificator` dans `form.vue`

**Fichiers** :
- `src/front/form.vue`
- `src/front/form.test.ts`

**Code** :
- Étendre `TabName` avec `'priority-modificator'`.
- Importer `PriorityModificator` depuis `./priority-modificator/priority-modificator.vue`.
- Ajouter bouton tab `data-testid="priority-modificator-tab"` (icône Material `priority_high` ou similaire, texte "Priority Modificator").
- Ajouter container `data-testid="priority-modificator-container"` rendant `<PriorityModificator />`.
- Position : entre team-modificator et user-stories.

**Tests** (suite `Priority modificator`, calquer suite team modificator) :
- tab visible
- click tab -> tab actif + team tab inactif
- click tab -> container actif
- click tab -> composant `PriorityModificator` visible

**Vérification** :
```
npm run type-check
npx vitest run src/front/form.test.ts
```

## Vérification par tâche

Après chaque tâche :
- `npm run type-check` — aucune erreur TS
- `npx vitest run <fichier-test>` — tests verts
- `npm run lint` — pas de regression Oxlint
