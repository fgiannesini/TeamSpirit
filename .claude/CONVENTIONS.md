### Fichiers

- Chaque `.vue`/`.ts` avec logique a son `X.test.ts` co-localisé (dot, pas dash — voir Anomalie ci-dessous).
- `<script setup>` avant `<template>`

1. **Factory de test**

   - Un `export const nomTypeCamelCase = (option(s): Partial<T> = {}): T => ({ ...defaults, ...option(s) })` par type, dans `front-factory-for-test.ts` et `simulate/factory.ts`.

2. **Tests**
   - Test qui reste vert = suspect. Si un nouveau test ne force aucun changement de code (comportement déjà couvert par un test plus général) → fusionner comme donnée dans le test existant, pas de test isolé.
   - Subsumption de test (test suite minimization) : un test A qui ne peut passer que si le comportement vérifié par un test B tient déjà (ex. `getComponent(X)`/`wrapper.get(...)` lève une exception si l'élément n'existe pas) *subsume* B — B n'apporte plus d'information propre, le supprimer. Ne pas confondre avec l'assertion roulette (nombre d'`expect()` dans un même test, pas redondance entre tests).
   - Assertion roulette (xUnit Test Patterns, Meszaros) : plusieurs `expect()` sur le même champ d'éléments différents → fusionner en assertion structurelle sur la collection projetée (`expect(a.map(e => e.x)).toStrictEqual([1, 1])`).
   - Avant de proposer un nouveau test : nommer l'état/comportement précis non couvert ; sinon ne pas signaler.
   - Edge case documentant la même logique qu'un test existant → donnée dans le test existant, pas nouveau test.

3. **Craft**
   - 4 règles design simple (Kent Beck, ordre priorité) : tests passent ; révèle intention (noms explicites, pas de commentaires explicatifs nécessaires) ; pas de duplication (DRY sur connaissance, pas sur syntaxe) ; éléments minimaux (YAGNI).
   - Boy Scout Rule : laisser chaque fichier touché plus propre qu'à l'arrivée.
   - SOLID : SRP (une seule raison de changer par fonction/classe/composant), OCP (étendre sans modifier — composition pas héritage), DIP (dépendre d'abstractions, injecter dépendances concrètes).
   - Clean Code : fonction fait une seule chose et courte, nommage révèle intention, pas de code mort ni de commentaires qui expliquent le quoi.

4. **Style**
   - Format Oxfmt (quotes simples, indent 2 espaces), lint Oxlint.
   - CSS : chercher classe BeerCSS en premier (docs `https://www.beercss.com`) avant tout style inline. Fallback inline seulement si aucune classe existante.
   - Commentaires + UI strings en français.

5. **Bonnes pratiques langages/libs**
   - **TypeScript** : Toujours typer, `readonly` si jamais muté, types union précis plutôt que broad, `as` cast justifié, retours de fonction typés explicitement si non évident.
   - **Vue 3** : `<script setup>` obligatoire, `defineProps`/`defineEmits` typés génériquement, `computed` pour valeurs dérivées complexes, `v-for` avec `:key` stable.
   - **Pinia** : accès store via `useXxxStore()`, actions pour toute mutation d'état.
   - **Vitest** : `toHaveBeenCalledWith` avec matchers asymétriques, `expect.any(Class)` pour objets complexes/non-déterministes, `new Class(args)` pour objets simples à contenu vérifié.

6. **Types pour refactoring**
   - Types trop larges masquant l'intention (`string` au lieu d'union littérale, `object` au lieu de type structuré).
   - Types inline répétés extractibles en alias nommé.
   - Retours `void` où un type précis est possible.

7. **Simplification**
   - Logique équivalente exprimable plus court (spread, flatMap, optional chaining, nullish coalescing).
   - Branchements imbriqués aplatissables (early return, guard clause).
   - Variables intermédiaires inutiles si la valeur est utilisée une seule fois sans gain de lisibilité.
