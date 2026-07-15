---
tags: [afk]
depends_on: [02]
files:
  - src/front/resume/resume.vue
  - src/front/resume/resume.test.ts
---

# 03 — Section Bugs

## Code

`src/front/resume/resume.vue`, à la suite de la section Reviewers. Calquer la section Équipe (tâche 02).

```
<resume-section icon="bug_report" label="Bugs" :mode="formStore.bugGeneratorMode"
                data-testid="bug-generator-mode">
  <span class="chip" v-for="bug in formStore.bugGenerations" :key="bug.id" :data-testid="'bug-' + bug.id">
    <span :data-testid="'bug-label-' + bug.id">
      Bug {{ bug.id }} — {{ toShortDate(bug.date) }} — {{ bug.complexity }}/{{ bug.reviewComplexity }}/{{ bug.priority }}
    </span>
    <div class="tooltip bottom" :data-testid="'bug-tooltip-' + bug.id">
      Complexité {{ bug.complexity }} · Review {{ bug.reviewComplexity }} · Priorité {{ bug.priority }}
    </div>
  </span>
</resume-section>
```

Section optionnelle → **pas** de `mandatory` : elle disparaît quand `bugGeneratorMode === 'notSet'`.

Le triplet reste abrégé dans la chip (15rem de large, potentiellement des dizaines de bugs) ; c'est le `<div class="tooltip bottom">` qui l'explicite au survol. Ce tooltip est le pattern BeerCSS déjà utilisé dans `src/front/shared/slider.vue:25`.

Introduire dans `<script setup>` la fonction locale de formatage de date, réutilisée par les tâches 05 et 06 :

```ts
const toShortDate = (date: Date): string =>
  date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
```

## Tests

`src/front/resume/resume.test.ts`, dans un `describe('Bugs')`. Données : `bugGeneration({ date: new Date('2025-07-14') })` (defaults `complexity: 3, reviewComplexity: 2, priority: 1`) et un second `bugGeneration({ id: 1, date: new Date('2025-07-18'), complexity: 5, reviewComplexity: 3, priority: 2 })`.

- Should display the bug generator mode (prop `mode` du `resume-section` `[data-testid=bug-generator-mode]`)
- Should display the bugs (assertion structurelle sur la collection projetée des labels : `['Bug 0 — 14/07 — 3/2/1', 'Bug 1 — 18/07 — 5/3/2']` — attention aux espaces produits par le retour à la ligne du template, normaliser)
- Should explain the bug values in a tooltip (`[data-testid=bug-tooltip-0]` → `Complexité 3 · Review 2 · Priorité 1`)

Le masquage en mode `notSet` et l'absence de chips en mode `random` sont déjà couverts par `resume-section.test.ts` (tâche 01) : ne pas les retester ici.

## Vérif

```bash
npm run type-check
npx vitest run src/front/resume/
```
