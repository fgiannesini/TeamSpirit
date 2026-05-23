# Extraction de sous-composants dans play.vue

## Contexte

### Ce qui existe
- `src/front/play/play.vue` — 914 lignes. Un seul SFC monolithique qui contient :
  - **Logique de simulation** (~330 lignes de script) : animation FLIP (`captureFlipPositions`, `animateFromPositions`, `animateBatch`), gestion d'événements (`handleTodo`, `handleInProgress`, `handleReview`, `handleToReview`, `handleDone`, `handleIdleThread`), partition parallèle (`conflicts`, `partitionParallel`), boucle temps (`processEvents`, `advanceStep`, `runNext`, `runAll`), build/présence (`buildUserStories`, `updateThreadPresence`, `updateStats`).
  - **Maps de présentation** : `THREAD_STATE_CLASSES`, `THREAD_STATE_BADGE_VARIANT`, `THREAD_STATE_ICON`, `THREAD_STATE_TOOLTIP`, `threadStateLabel`, `priorityChipClass`.
  - **Template** : barre de nav (back + progress + stats + team-type + loader + boutons compute/compute-all), colonne Backlog, colonne Threads (header + stories in-progress + stories review + idle hint), colonne Done. La carte de story est **dupliquée 4 fois** (backlog, thread in-progress, thread review, done) avec des variantes de classes.
  - **Styles scoped** : `.story-card`, `.priority-badge`, `.thread-state-badge`, `.thread`, `.thread-header`, `.thread-stories`, `.column-count`, `.loader-spinner`, etc.
- Convention projet déjà établie : composants carte présentationnels avec leur propre test — `user-story-card.vue` + `user-story-card.test.ts`, `developer-card.vue`, `period-card.vue`, `priority-card.vue`. Tous : props in / `defineEmits` out / `data-testid` dans le template / testés en isolation par `mount`.
- `ThreadVue` et `ThreadState` sont déjà `export`és depuis `play.vue` (importés par `src/flow/render-time.ts` — attention à ne pas casser cet import). `UserStoryVue` n'est PAS exporté.

### Ce qui manque
- Aucune décomposition : le template a 4 copies quasi identiques de la carte de story (lignes 487-515, 576-604, 605-634, 666-696) → duplication de connaissance (règle 3 du design simple violée).
- Les maps de présentation et `priorityChipClass`/`threadStateLabel` mélangent présentation et orchestration dans le même fichier (SRP violé).

### Contrainte critique sur les tests (à intégrer dans CHAQUE tâche)
`play.test.ts` monte `play.vue` via **`shallowMount`** → **tous les composants enfants sont stubbés automatiquement**. Conséquences :
- Tout `data-testid` déplacé dans un sous-composant **disparaît** du DOM rendu par `play.test.ts` (remplacé par `<mon-composant-stub ...>`). Les `wrapper.get('[data-testid=...]')` correspondants **échoueront**.
- Deux stratégies de migration de test, à choisir par cas :
  1. **Migrer l'assertion UI vers le `.test.ts` du nouveau composant** (monté en isolation avec `mount`) — pour tout ce qui teste le RENDU d'une carte/badge (nom, titre `#id`, classe de priorité, icône, libellé, tooltip). C'est la stratégie par défaut, conforme à la convention `user-story-card.test.ts`.
  2. **Réécrire l'assertion dans `play.test.ts` pour viser le stub** via `wrapper.findComponent(StoryCard)` / `findAllComponents` + `.props(...)` — pour tout ce qui teste l'ORCHESTRATION (une story est-elle dans tel thread/backlog/done, combien de cartes, ordre de tri). Le `data-testid` du conteneur (`backlog`, `done`, `thread-user-story-N`) reste sur `play.vue` donc reste interrogeable ; ce qui change c'est la sélection de la carte enfant.
- `findAll('[data-flip-id="story-0"]')` (tests anti-duplication) : `data-flip-id` doit rester sur l'élément racine du sous-composant `StoryCard` ET être transmis depuis `play.vue`. Avec `shallowMount`, un attribut fallthrough (`data-flip-id`) posé sur `<StoryCard data-flip-id=...>` apparaît sur le stub → `findAll('[data-flip-id=...]')` continue de matcher le stub. À VÉRIFIER explicitement (tâche dédiée de garde-fou).
- `findAll('[data-testid^=user-story-]')` (tri backlog) : idem, le `data-testid` passé en attribut au stub reste sélectionnable sur le stub. Stratégie 2.

### Ordre retenu : du plus isolé (présentation pure, zéro logique simulation) au plus couplé.

---

## Tâches

> Après CHAQUE tâche : `npm run type-check` + `npx vitest run src/front/play/play.test.ts` (+ le nouveau `.test.ts`) + `npm run format`. Ne jamais passer à la tâche suivante avec un test rouge.

### Tâche 1 — Extraire `PriorityBadge`
- [x] **Fichier cible** : `src/front/play/priority-badge.vue` (+ `src/front/play/priority-badge.test.ts`)
- **Ce qui bouge** :
  - Le `<span class="priority-badge ...">` répété 4× (ex. lignes 506-514) → composant unique.
  - `priorityChipClass` (lignes 305-309) déménage DANS `priority-badge.vue` (c'est sa seule responsabilité de présentation).
  - Props : `{ priority: number; storyId: number }`. Template : conserve `:data-testid="`priority-${storyId}`"`, `:aria-label="`Priority ${priority}`"`, icône `flag`, classe via `priorityChipClass`.
  - Déplacer le bloc CSS `.priority-badge { ... }` (lignes 789-820) vers le `<style scoped>` du nouveau composant.
  - Dans `play.vue` : remplacer les 4 blocs `<span priority-badge>` par `<priority-badge v-if="story.priority !== null" :priority="story.priority" :story-id="story.id" />`.
- **Impact test** :
  - Stratégie 1. Créer `priority-badge.test.ts` (mount direct) couvrant : `aria-label "Priority N"` ; présence icône `flag` ; les 3 classes couleur (priority 5+ → primary, 2 et 4 → secondary, 1 → tertiary). Reprendre les cas de `describe('Priority chip')` (lignes 1209-1246) et `describe('Priority chip color')` (lignes 2227-2307).
  - Dans `play.test.ts` : les tests `Priority chip color` (4 tests) et `Priority chip` (aria-label, flag icon) qui font `wrapper.get('[data-testid=priority-0]')` vont casser (le span devient stub). → Les SUPPRIMER de `play.test.ts` (couverts par le nouveau test) MAIS garder dans `play.test.ts` les tests qui vérifient que la priorité s'affiche au bon ENDROIT (in-progress/review/done cards, lignes 1248-1318) en les réécrivant pour viser le stub : `card.findComponent(PriorityBadge).props('priority')` au lieu de `card.get('[data-testid=priority-0]').attributes('aria-label')`.
- **Risque** : aucun (présentation pure, aucune dépendance à la logique de simulation).

### Tâche 2 — Extraire `ThreadStateBadge`
- [ ] **Fichier cible** : `src/front/play/thread-state-badge.vue` (+ `src/front/play/thread-state-badge.test.ts`)
- **Ce qui bouge** :
  - Le `<span class="thread-state-badge ...">` (lignes 551-568) → composant.
  - Les maps `THREAD_STATE_BADGE_VARIANT` (288-293), `THREAD_STATE_ICON` (295-300), `THREAD_STATE_TOOLTIP` (311-316) déménagent dans le composant. `threadStateLabel` (302-303) y déménage aussi (calcul de `'Off' | ThreadState` à partir de `presence`/`state`).
  - Props : `{ threadId: number; state: ThreadState; presence: string }`. Le composant calcule lui-même le label affiché.
  - Conserver `:data-testid="`thread-state-${threadId}`"`, `:id`, `role="status"`, `aria-live`, `:title`, et les `data-testid` internes `thread-state-icon-${threadId}` / `thread-state-label-${threadId}`.
  - Déplacer le CSS `.thread-state-badge { ... }` (755-787) vers le composant.
  - `ThreadState` : l'importer depuis `play.vue` (déjà exporté) ou déplacer la définition de type dans un module partagé `src/front/play/thread.ts` (voir Tâche 6). Pour cette tâche, importer depuis `play.vue` suffit.
- **Impact test** :
  - Stratégie 1. Créer `thread-state-badge.test.ts` couvrant tous les cas de : `describe('Thread state badge variant')` (288-362), `describe('Thread state label')` (364-394), `describe('Thread state icon')` (396-477), `describe('Thread state tooltip')` (479-553). Pour chaque état Wait/Develop/Review/Off : classe variant, libellé texte, icône, tooltip, plus `role="status"`.
  - Dans `play.test.ts` : tous ces tests font `wrapper.get('[data-testid=thread-state-...]')` → cassent (stub). À SUPPRIMER (couverts par le nouveau test). MAIS les tests du `describe('Thread')` (82-286) qui vérifient l'état du thread via `[data-testid=thread-state-label-0]` (ex. "Should set thread state to Develop", lignes 203-285) testent en réalité l'ORCHESTRATION (la transition d'état déclenchée par les events) → les réécrire pour viser le stub : `wrapper.findComponent(ThreadStateBadge).props('state')` (ou `props('presence')` pour Off). Garder ces tests dans `play.test.ts`.
  - Test "Should wrap thread name and state in a header element" (2207-2224) : `thread.find('.thread-header [data-testid=thread-state-0]')` → `[data-testid=thread-state-0]` est désormais sur le stub, donc présent comme attribut fallthrough — vérifier que `find('.thread-header').findComponent(ThreadStateBadge).exists()` est la formulation correcte.
- **Risque** : faible. Le badge ne dépend que de props simples.

### Tâche 3 — Extraire `StoryCard`
- [ ] **Fichier cible** : `src/front/play/story-card.vue` (+ `src/front/play/story-card.test.ts`)
- **Ce qui bouge** : la carte de story dupliquée 4× (backlog 487-515, thread in-progress 576-604, thread review 605-634, done 666-696). Unifier en un composant paramétré par variante.
  - Props : `{ story: UserStoryVue; testId: string; flashing: boolean; variant: 'default' | 'review' | 'done' }` (le `testId` est calculé par `play.vue` car il diffère : `user-story-{id}` vs `user-story-{id}-{threadId}`).
  - Le composant utilise `PriorityBadge` (Tâche 1) en interne.
  - Template : `:data-testid="testId"`, `:data-flip-id="'story-' + story.id"`, classes de base + variant conditionnelle (`story-card--review`, `story-card--done`, `primary-container` pour done), `priority-flash` selon `flashing`. Span `story-name` avec `:title="`#${story.id}`"`. Icône `check_circle` uniquement si `variant === 'done'`.
  - Déplacer le CSS `.story-card { ... }` (828-845) et `.priority-flash` / `@keyframes priority-flash` (901-913) vers le composant.
- **Impact test** :
  - Stratégie 1 + 2 (le plus délicat car beaucoup de tests touchent la carte).
  - Créer `story-card.test.ts` (mount direct, donc `PriorityBadge` réellement rendu) couvrant le RENDU : classe `story-card` ; `story-name` text + title `#id` ; variantes `story-card--review` / `story-card--done` ; icône `check_circle` en done ; `priority-flash` quand `flashing=true` ; absence de `priority-flash` sinon ; transmission `priority` au `PriorityBadge`. Reprendre : `describe('Story id surface')` (1108-1207, rendu du title), une partie de `describe('Priority flash')` (le RENDU de la classe selon prop).
  - Dans `play.test.ts` (réécriture stratégie 2 — c'est le gros du travail) :
    - Tests qui localisent une story (`describe('User story')` 555-1106, `describe('Backlog sort by priority')` 1829-1872, etc.) font `wrapper.get('[data-testid=user-story-0]')` / `find('[data-testid=user-story-0-0]')`. Le `data-testid` passé au stub `<StoryCard data-testid=...>` reste un attribut fallthrough sélectionnable → **ces sélecteurs CONTINUENT de fonctionner sur le stub**. À VÉRIFIER (cf. Tâche garde-fou) ; si OK, ces tests changent peu (le `.get('[data-testid=story-name]')` interne ne marche plus → remplacer par `.findComponent(StoryCard).props('story').name` quand on veut le nom).
    - Tests `data-flip-id` anti-duplication (934-1057) : `findAll('[data-flip-id="story-0"]')`. Idem fallthrough sur stub — VÉRIFIER.
    - Tests `priority-flash` au bon endroit (2053-2122) : `wrapper.get('[data-testid=user-story-0]').classes()` → la classe `priority-flash` est désormais appliquée DANS le composant (sur sa racine), pas sur le stub. → réécrire en `wrapper.findComponent(StoryCard).props('flashing')` ou cibler par testId : `findAllComponents(StoryCard).find(c => c.props('testId') === 'user-story-0').props('flashing')`.
    - Tests de tri (1847-1870) : `findAll('[data-testid^=user-story-]')` sur stubs — fallthrough, VÉRIFIER.
- **Risque** : élevé en volume de tests touchés. Faire APRÈS Tâche 1 (PriorityBadge déjà extrait, donc StoryCard l'utilise directement).
- **Dépend de** : Tâche 1.

### Tâche 4 — Extraire `ThreadColumn` (ou `ThreadCard`)
- [ ] **Fichier cible** : `src/front/play/thread-card.vue` (+ `src/front/play/thread-card.test.ts`)
- **Ce qui bouge** : le bloc `<div v-for="thread in threads">` complet (lignes 529-647) — header (titre + `ThreadStateBadge`), liste in-progress (`StoryCard` variant default), liste review (`StoryCard` variant review), idle hint (`thread-idle-{id}`).
  - Props : `{ thread: ThreadVue; flashingStoryIds: Set<number> }`. (Le set de flash est lu pour calculer `flashing` par story.)
  - Utilise `ThreadStateBadge` (Tâche 2) et `StoryCard` (Tâche 3).
  - Conserver `:data-testid="`thread${thread.id}`"`, `thread-title-${id}`, `thread-user-story-${id}`, `thread-idle-${id}`, et les classes d'état via `THREAD_STATE_CLASSES` (cette map reste utilisée ici → la déplacer dans `thread-card.vue` ou un module `thread.ts`).
  - Déplacer CSS `.thread`, `.thread-header`, `.thread-stories`, `.thread-idle-hint` (847-899) vers le composant.
- **Impact test** :
  - Créer `thread-card.test.ts` couvrant : init (classe `thread`, titre, conteneur stories) ; idle hint visible en Wait sans story, caché si in-progress / review / off (reprendre `describe('Thread idle hint')` 2309-2375) ; classes d'état develop/review/off sur la racine (reprendre `describe('Thread')` 105-201 pour les classes `off`).
  - Dans `play.test.ts` : `wrapper.get('[data-testid=thread0]')`, `[data-testid=thread-title-0]`, `[data-testid=thread-user-story-0]` deviennent des attributs fallthrough sur le stub `<ThreadCard>`. Mais ATTENTION : avec `shallowMount`, le contenu interne du thread (les `StoryCard`) n'est plus rendu du tout → les tests d'orchestration `threadUserStory0.find('[data-testid=user-story-0-0]')` ne trouveront RIEN (le thread est un stub vide). → Ces tests d'orchestration (la majorité de `describe('User story')`) doivent alors vérifier les **props passées au stub `ThreadCard`** : `wrapper.findAllComponents(ThreadCard).find(c => c.props('thread').id === 0).props('thread').inProgressStories` contient l'id voulu. C'est une réécriture lourde.
- **Risque** : TRÈS élevé. Extraire `ThreadCard` masque tout l'intérieur des threads sous `shallowMount`, ce qui touche ~25 tests d'orchestration. **Décision recommandée** : n'extraire `ThreadCard` QUE si on accepte de réécrire ces tests en mode "inspection de props". Sinon, s'arrêter à la Tâche 3 (StoryCard + badges), qui apporte déjà la dé-duplication majeure sans masquer l'orchestration des threads.
- **Dépend de** : Tâches 2 et 3.

### Tâche 5 — Extraire `KanbanColumn` (Backlog / Done génériques)
- [ ] **Fichier cible** : `src/front/play/kanban-column.vue` (+ `src/front/play/kanban-column.test.ts`)
- **Ce qui bouge** : les colonnes Backlog (469-518) et Done (651-699) partagent la structure : `<article>` + `<nav>` header (icône + titre + compteur) + état vide + liste de `StoryCard`. Unifier.
  - Props : `{ title: string; icon: string; testIdPrefix: 'backlog' | 'done'; stories: UserStoryVue[]; emptyContent: slot; variant }`. Le compteur stories/story et les états vides diffèrent (backlog-empty vs done-empty avec total count) → utiliser un `<slot name="empty">` pour le contenu vide spécifique.
  - Conserver `data-testid` : `backlog`/`done`, `backlog-count`/`done-count`, `column-count` CSS.
- **Impact test** : MÊME problème que Tâche 4 — sous `shallowMount`, l'intérieur de la colonne (cartes) disparaît. Les tests `done.find('[data-testid=user-story-0]')`, `backlog.find(...)` (très nombreux dans `describe('User story')`) ne trouveront plus rien. → Réécriture en inspection de props sur le stub `KanbanColumn` (`.props('stories')`).
- **Risque** : TRÈS élevé (même nature que Tâche 4). **Décision recommandée** : optionnel / à éviter sauf besoin fort. La dé-duplication apportée est modérée (2 colonnes) au prix d'une grosse réécriture de tests. Ne faire qu'après Tâches 1-3 stabilisées.
- **Dépend de** : Tâche 3.

### Tâche 6 — (Préparatoire, optionnelle) Externaliser types + maps partagés
- [ ] **Fichier cible** : `src/front/play/thread.ts`
- **Ce qui bouge** : `ThreadState`, `ThreadVue`, `UserStoryVue` (types) + éventuellement `THREAD_STATE_CLASSES`. Permet aux sous-composants d'importer les types sans dépendre de `play.vue` (qui importe gsap, etc.).
- **Impact** : `src/flow/render-time.ts` importe `ThreadVue` depuis `play.vue` → mettre à jour cet import (ou re-exporter depuis `play.vue` pour compat). Vérifier `src/flow/render-time.ts` et `flow.test.ts`.
- **Impact test** : neutre si re-export maintenu. Faire en Tâche 0 si on veut éviter les imports croisés vers `play.vue` dans les nouveaux composants.
- **Risque** : faible, mais touche `src/flow/`. À traiter en premier (renommer Tâche 0) si les Tâches 1-5 importent des types.

---

## Recommandation de périmètre

- **Périmètre sûr et à fort ROI** : Tâches 1 → 2 → 3 (+ Tâche 6/0 si besoin de types partagés). Elles extraient de la présentation PURE, dé-dupliquent la carte de story (4 copies → 1), et n'exigent que des réécritures de tests "rendu → migré dans le test du composant" + quelques inspections de props. L'orchestration des threads/colonnes reste visible sous `shallowMount`.
- **Périmètre coûteux** : Tâches 4 et 5 masquent l'intérieur des conteneurs sous `shallowMount` et imposent de réécrire ~25-40 tests d'orchestration en inspection de props. À ne lancer que si la lisibilité du template l'exige et avec accord explicite.

## Garde-fou à exécuter AVANT la réécriture des tests (sous-tâche de la Tâche 1)
- [ ] Écrire un micro-test jetable (ou vérifier dans le REPL vitest) : monter `play.vue` en `shallowMount` après extraction de `PriorityBadge`, et confirmer le comportement de `findComponent(PriorityBadge)`, ainsi que la persistance des attributs fallthrough (`data-testid`, `data-flip-id`) sur les stubs via `wrapper.find('[data-flip-id=...]')`. Cela valide/invalide la "stratégie 2" pour toutes les tâches suivantes. Si les attributs ne passent PAS au stub, basculer ces tests en `findComponent().props()` partout.

## Vérification par tâche

Après chaque tâche :
- `npm run type-check` — aucune erreur TS / vue-tsc
- `npx vitest run src/front/play/play.test.ts` — tous tests passent
- `npx vitest run src/front/play/<nouveau-composant>.test.ts` — tous tests passent
- `npx vitest run src/flow/flow.test.ts` — non régressé (si Tâche 6 touche les types exportés)
- `npm run format`
