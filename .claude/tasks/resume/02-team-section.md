---
tags: [afk]
depends_on: [01]
files:
  - src/front/resume/resume.vue
  - src/front/resume/resume.test.ts
---

# 02 — Migrer la section Équipe sur `resume-section`

Tâche de refactoring : **aucun comportement visible ne change**. Elle installe le motif que les tâches 03 à 06 recopient.

## Code

`src/front/resume/resume.vue` :

- Supprimer le computed `teamModeLabel` (il vit désormais dans `resume-section.vue`, tâche 01).
- Remplacer le `<nav>` Équipe **et** le `<div class="row wrap">` des developers par :

```
<resume-section icon="groups" label="Équipe" :mode="formStore.teamMode" mandatory>
  <span class="chip" v-for="developer in formStore.developers" :key="developer.id"
        :data-testid="'developer-' + developer.id">
    Dev {{ developer.id }} — exp. {{ developer.experience }}
  </span>
</resume-section>
```

Deux points :
- `mandatory` → la ligne Équipe reste visible avec sa chip `Not set`, comme aujourd'hui.
- Les chips developers passent de `<button class="chip">` à `<span class="chip">` : elles étaient cliquables sans aucun handler. Le `v-if="teamMode === 'custom'"` disparaît, c'est `resume-section` qui ne rend le slot qu'en mode `custom`.

- Le `<nav>` Reviewers reste écrit en clair, inchangé : il n'a pas de `SelectorMode`, sa chip est un nombre.

## Tests

`src/front/resume/resume.test.ts` : les 7 tests existants restent, aucun n'est supprimé. Seul le sélecteur de la chip de mode change — `data-testid="team-mode"` doit désormais être porté par le `<resume-section>` de l'équipe (la chip interne du composant porte `data-testid="mode"`).

Comme les tests utilisent `shallowMount`, `resume-section` est stubé : pour lire le mode, assertionner sur la prop plutôt que sur le texte, par exemple

```ts
expect(wrapper.getComponent<typeof ResumeSection>('[data-testid=team-mode]').props('mode')).toBe('random');
```

et remplacer les assertions de texte (`'Random'`, `'Not set'`) en conséquence — le rendu du libellé est déjà couvert par `resume-section.test.ts` (tâche 01), le dupliquer ici serait redondant (cf. subsomption, `.claude/CONVENTIONS.md` §2).

Attention : avec `shallowMount`, le contenu du slot n'est pas rendu par le stub par défaut. Configurer le stub de `resume-section` pour rendre son slot (voir `src/test-setup.ts`, qui fait exactement ça pour `selector`) afin que les tests sur `developer-0` / `developer-1` restent valides — la variante « masqué en mode random / notSet » est alors testée dans `resume-section.test.ts`, pas ici.

## Vérif

```bash
npm run type-check
npx vitest run src/front/resume/
```
