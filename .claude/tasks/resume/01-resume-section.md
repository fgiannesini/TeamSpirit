---
tags: [review]
depends_on: []
files:
  - src/front/resume/resume-section.vue
  - src/front/resume/resume-section.test.ts
---

# 01 — Composant générique `resume-section.vue` [x]

## Code

Nouveau composant `src/front/resume/resume-section.vue`. Aucun accès au store : tout passe par les props.

```ts
defineProps<{ icon: string; label: string; mode: SelectorMode; mandatory?: boolean }>();
```

`SelectorMode` importé depuis `../form-store.ts`.

`mandatory` reprend le vocabulaire de `src/front/shared/selector.vue` : une section obligatoire (Équipe, User stories) reste **toujours** affichée, avec la chip `Not set` tant qu'elle n'est pas configurée. Une section optionnelle (Bugs, Modifications de priorité, Modifications d'équipe) **disparaît** quand son mode est `notSet` — le panneau ne fait que 15rem de large.

Computed `modeLabel` : le `switch` exhaustif déjà présent dans `resume.vue` (`random → 'Random'`, `custom → 'Custom'`, `notSet → 'Not set'`). Il est **déplacé** ici, pas dupliqué.

Template :

```
<template v-if="mandatory || mode !== 'notSet'">
  <nav>
    <i>{{ icon }}</i>
    <span class="max">{{ label }}</span>
    <span class="chip" data-testid="mode">{{ modeLabel }}</span>
  </nav>
  <div class="row wrap" v-if="mode === 'custom'">
    <slot />
  </div>
</template>
```

Le `<slot>` reçoit les chips d'éléments ; il n'est rendu qu'en mode `custom`.

## Tests

`src/front/resume/resume-section.test.ts`, `shallowMount` avec props, sans Pinia. Calquer le style de `src/front/bug-generator/bug-card.test.ts`.

- Should render the icon
- Should render the label
- Should display the mode label (données : `random` → `Random`, `custom` → `Custom`, `notSet` → `Not set`)
- Should not render anything when mode is notSet
- Should render when mode is notSet and section is mandatory
- Should render the slot content when mode is custom
- Should not render the slot content when mode is random

## Vérif

```bash
npm run type-check
npx vitest run src/front/resume/resume-section.test.ts
```
