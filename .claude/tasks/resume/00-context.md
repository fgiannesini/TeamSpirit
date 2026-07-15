# Résumé de configuration

Le panneau `resume.vue` est monté dans un `nav.right` de **15rem** (`form.vue:126`, `simulation.vue:71`). Il doit résumer toute la configuration saisie. Aujourd'hui il ne couvre que `teamMode` + `developers` + `reviewers` : 4 modes sur 5 sont absents (`teamModificatorMode`, `priorityModificatorMode`, `bugGeneratorMode`, `userStoriesMode`).

## Décisions actées

- **Section masquée si `mode === 'notSet'`** — l'espace est de 15rem, on ne montre que ce qui est configuré. Seule la ligne Équipe reste toujours visible avec sa chip `Not set` (comportement existant, tests existants).
- **Mode `random` → chip du mode seule**, aucun détail. C'est déjà ce que fait `teamMode: 'random'`.
- **Mode `custom` → une chip compacte par élément**, calquée sur l'existant `Dev 0 — exp. 3`.
- **Les valeurs numériques abrégées sont explicitées par un tooltip au survol**, pas par du texte en plus : les chips doivent tenir dans 15rem et il peut y en avoir des dizaines. On réutilise le `<div class="tooltip bottom">` de BeerCSS, déjà en usage dans `src/front/shared/slider.vue:25`.
- **Extraction d'un `resume-section.vue` générique** : le bloc `<nav>` et le `switch` sur `SelectorMode` allaient être dupliqués 5 fois. Ils vivent une seule fois dans ce composant.
- **La section Reviewers reste écrite en clair dans `resume.vue`** : elle n'a pas de `SelectorMode` (sa chip est un nombre), elle ne rentre pas dans `resume-section`.
- **Nettoyage (Boy Scout)** : les chips d'éléments sont aujourd'hui des `<button class="chip">` cliquables sans handler → `<span class="chip">`.
- **Libellés en français** (`.claude/CONVENTIONS.md` §4), **icônes reprises des onglets** de `form.vue`.
- **Ordre des sections = ordre des onglets** : Équipe, Reviewers, Modifications d'équipe, Modifications de priorité, Bugs, User stories. (Les tâches, elles, sont numérotées de la plus simple à la plus complexe.)

## Format des chips

| Section | Icône | Libellé | Mode | Chip élément | Tooltip |
|---|---|---|---|---|---|
| Équipe | `groups` | `Équipe` | `teamMode` (mandatory) | `Dev 0 — exp. 3` *(existant)* | — |
| Reviewers | `rate_review` | `Reviewers` | — | `1` *(existant)* | — |
| Modifications d'équipe | `group_remove` | `Modifications d'équipe` | `teamModificatorMode` | `Période 0 — 14/07→20/07 — 2 devs` | — |
| Modifications de priorité | `priority_high` | `Modifications de priorité` | `priorityModificatorMode` | `Prio 0 — 14/07 — 2 US → 5` | `Nouvelle priorité 5 · 2 user stories` |
| Bugs | `bug_report` | `Bugs` | `bugGeneratorMode` | `Bug 0 — 14/07 — 3/2/1` | `Complexité 3 · Review 2 · Priorité 1` |
| User stories | `book_4` | `User stories` | `userStoriesMode` (mandatory) | `US 0 — 3/2/1` | `Complexité 3 · Review 2 · Priorité 1` |

Le triplet `3/2/1` se lit toujours **complexité / review / priorité**, dans l'ordre des sliders des cartes du formulaire (`bug-card.vue`, `user-story-card.vue`). Il n'est jamais légendé en clair dans la chip : c'est le tooltip qui le fait.

Dates au format `JJ/MM` (fonction locale `toShortDate` dans `resume.vue`, introduite en 03).

## Structure d'une chip avec tooltip

```
<span class="chip" :data-testid="'user-story-' + userStory.id">
  <span :data-testid="'user-story-label-' + userStory.id">US 0 — 3/2/1</span>
  <div class="tooltip bottom" :data-testid="'user-story-tooltip-' + userStory.id">
    Complexité 3 · Review 2 · Priorité 1
  </div>
</span>
```

Le `data-testid` du label est distinct de celui de la chip : `wrapper.get(chip).text()` concaténerait le texte du tooltip.

## Existant

- `src/front/resume/resume.vue` (41 lignes) et `src/front/resume/resume.test.ts` (7 tests) — à lire avant de commencer.
- État du store : `src/front/form-store.ts` — `State`, `SelectorMode`, `Developer`, `TeamModification`, `PriorityModification`, `BugGeneration`, `UserStory`.
- Factories de test : `src/front/front-factory-for-test.ts` — `developer()`, `userStory()`, `bugGeneration()`, `priorityModification()`, `teamModification()`, toutes en `(options: Partial<T> = {}) => T`.
- Style de test à calquer : `src/front/bug-generator/bug-card.test.ts` (props/emits) et `src/front/bug-generator/custom-bug-generator.test.ts` (store + `createTestingPinia`).
- CSS : BeerCSS. Classes en usage ici : `article`, `nav`, `chip`, `max`, `row wrap`. Icônes Material Symbols en texte nu dans `<i>`.

## Vérification (après chaque tâche)

```bash
npm run type-check
npx vitest run <fichier-test-de-la-tâche>
```
