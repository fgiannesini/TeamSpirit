# Conventions

Fichier séparé de `CLAUDE.md` — `/init` régénère `CLAUDE.md` uniquement, ce fichier est immunisé.

Deux sources :
- Règles dictées explicitement par l'utilisateur (section "Règles perso")
- Conventions implicites détectées en scannant le code, non encore documentées ailleurs (section "Conventions détectées")

## Règles perso

_(à compléter — dicter les règles ici)_

## Conventions détectées

Scan effectué sur `src/front/**` + `src/simulate/*.ts`, patterns récurrents ≥3 fichiers, non couverts par `CLAUDE.md` ni `reviewer.md`.

### Fichiers

- Chaque `.vue`/`.ts` avec logique a son `X.test.ts` co-localisé (dot, pas dash — voir Anomalie ci-dessous).
- `<script setup>` avant `<template>` (majoritaire, 20/24 fichiers). Exceptions : `team/developer-card.vue`, `reviewers/reviewers.vue`, `priority-modificator/custom-priority-modificator.vue`, `team-modificator/custom-team-modificator.vue`.

### Props / Emits

- `defineProps` avant `defineEmits`, jamais de type nommé `XxxProps` — toujours générique inline.
- `defineEmits` : syntaxe array non typée si payload primitif/absent (`slider.vue`, `selector.vue`, `developer-card.vue`) ; générique typé `defineEmits<{...}>()` si payload objet/Date (`priority-card.vue`, `period-card.vue`).
- Emit `remove` pour suppression (consommé `@remove="removeX(id)"` dans les `custom-*.vue`) ; `update:xxx` nommé pour v-model, jamais `update:modelValue` brut.

### data-testid

- Header de carte → `data-testid="title"` (générique, pas de nom par composant) : `developer-card.vue`, `priority-card.vue`, `period-card.vue`, `user-story-card.vue`, `reviewers.vue`.
- Chaque champ a son `{field}-label` associé : `experience-label`, `complexity-label`, `date-label`, etc.

### Pattern `custom-*.vue` (wrapper liste)

Squelette identique dans `custom-team.vue`, `custom-priority-modificator.vue`, `custom-team-modificator.vue`, `custom-user-stories.vue` :
- `hasXxx` computed guard
- `addXxx()` → `store.generateXxx()`, `removeXxx(id)` → `store.removeXxx(id)`
- Template : `v-if hasXxx` → `data-testid="setting-state"` (add-button + grid cartes `@remove`) ; sinon `data-testid="empty-state"` (icône + message + add-button)

### Pattern "mode selector" (wrapper fin)

`team.vue`, `team-modificator.vue`, `priority-modificator.vue`, `user-stories.vue` — même forme :
```vue
const store = useFormStore();
<Selector v-model:selectedMode="store.xMode" :mandatory="…"><CustomX /></Selector>
```

### Store (`form-store.ts`)

- Paire `generateX()` / `removeX(targetId)` — corps fixe : generate = `this.x = [...this.x, { id: nextId(this.x), ...defaults }]` ; remove = `this.x = this.x.filter(({id}) => id !== targetId)`.
- Helper traducteur `toXEvents(items: X[], today: Date): XEvent[]` — même signature pour `toTeamModificatorEvents`, `toPriorityModificatorEvents`, `toBugGeneratorEvents`.

### Stratégie domaine (`src/simulate/*.ts`)

Triplet `noX` (null-object) + `RandomX` + `CustomX` implémentant interface `X` : confirmé pour `bug-generator.ts`, `priority-modificator.ts`, `team-modificator.ts`. Toute nouvelle stratégie domaine suit ce triplet.

### Factory de test

- Un `export const nomTypeCamelCase = (option(s): Partial<T> = {}): T => ({ ...defaults, ...option(s) })` par type, dans `front-factory-for-test.ts` et `simulate/factory.ts`.
- Incohérence à corriger : param nommé `option` (singulier) dans `front-factory-for-test.ts`, `options` (pluriel) dans `simulate/factory.ts` — à uniformiser si l'un des deux fichiers est retouché.

### Imports

Groupes non lint-enforcés (`.oxlintrc.json` n'a pas de plugin import-order) mais respectés partout : packages externes (alpha) → `import type` relatifs → imports relatifs valeur/composants (alpha). Voir `form-store.ts:1-27`, `simulation.ts:1-13`, `play.vue:1-10`.

## Anomalies détectées (pas des conventions — bugs latents)

- `src/front/App.vue` n'a pas de `App.test.ts` — à vérifier si volontaire (composant racine trivial) ou oubli.

Faux positif écarté : `src/front/router-test.ts` (tiret) n'est PAS un spec — c'est un helper de test (`createTestRouter()`), importé par `simulation/simulation.test.ts:6`. Nommage volontaire pour le distinguer d'un fichier `.test.ts`, exclu du glob Vitest à raison. Pas de renommage à faire.
