---
tags: [afk]
depends_on: [04]
files:
  - src/front/resume/resume.vue
  - src/front/resume/resume.test.ts
---

# 05 — Section Modifications de priorité

## Code

`src/front/resume/resume.vue`. Calquer la section Bugs (tâche 03) ; `toShortDate` existe déjà depuis cette tâche.

```
<resume-section icon="priority_high" label="Modifications de priorité"
                :mode="formStore.priorityModificatorMode" data-testid="priority-modificator-mode">
  <span class="chip" v-for="modification in formStore.priorityModificators" :key="modification.id"
        :data-testid="'priority-modification-' + modification.id">
    <span :data-testid="'priority-modification-label-' + modification.id">
      Prio {{ modification.id }} — {{ toShortDate(modification.date) }}
      — {{ modification.selectedUserStories.length }} US → {{ modification.priority }}
    </span>
    <div class="tooltip bottom" :data-testid="'priority-modification-tooltip-' + modification.id">
      Nouvelle priorité {{ modification.priority }} · {{ modification.selectedUserStories.length }} user stories
    </div>
  </span>
</resume-section>
```

Section optionnelle → pas de `mandatory`.

Le détail des user stories sélectionnées est réduit à leur **nombre** : le panneau fait 15rem et une modification peut en viser une dizaine.

## Tests

`src/front/resume/resume.test.ts`, dans un `describe('Modifications de priorité')`. Données : `priorityModification({ date: new Date('2025-07-14'), selectedUserStories: [userStory(), userStory({ id: 1 })], priority: 5 })`.

- Should display the priority modificator mode (prop `mode` du `resume-section` `[data-testid=priority-modificator-mode]`)
- Should display the priority modifications (label → `Prio 0 — 14/07 — 2 US → 5`)
- Should explain the priority modification in a tooltip (`Nouvelle priorité 5 · 2 user stories`)

## Vérif

```bash
npm run type-check
npx vitest run src/front/resume/
```
