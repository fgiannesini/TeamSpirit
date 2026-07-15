---
tags: [afk]
depends_on: [05]
files:
  - src/front/resume/resume.vue
  - src/front/resume/resume.test.ts
---

# 06 — Section Modifications d'équipe

## Code

`src/front/resume/resume.vue`. Calquer la section Modifications de priorité (tâche 05) ; `toShortDate` existe déjà.

```
<resume-section icon="group_remove" label="Modifications d'équipe"
                :mode="formStore.teamModificatorMode" data-testid="team-modificator-mode">
  <span class="chip" v-for="modification in formStore.teamModificators" :key="modification.id"
        :data-testid="'team-modification-' + modification.id">
    Période {{ modification.id }}
    — {{ toShortDate(modification.period.start) }}→{{ toShortDate(modification.period.end) }}
    — {{ modification.selectedDevelopers.length }} devs
  </span>
</resume-section>
```

Section optionnelle → pas de `mandatory`. Comme en 05, les développeurs sélectionnés sont réduits à leur nombre.

Placer la section à sa place dans l'ordre des onglets de `form.vue` : Équipe, Reviewers, **Modifications d'équipe**, Modifications de priorité, Bugs, User stories. Les tâches 03 à 06 ayant été écrites de la plus simple à la plus complexe, c'est ici qu'on remet le template dans le bon ordre.

## Tests

`src/front/resume/resume.test.ts`, dans un `describe("Modifications d'équipe")`.

- Should display the team modificator mode (prop `mode` du `resume-section` `[data-testid=team-modificator-mode]`)
- Should display the team modifications (données : `teamModification({ period: { start: new Date('2025-07-14'), end: new Date('2025-07-20') }, selectedDevelopers: [developer(), developer({ id: 1 })] })` → chip `Période 0 — 14/07→20/07 — 2 devs`)

## Vérif

```bash
npm run type-check
npx vitest run src/front/resume/
npm run lint
```
