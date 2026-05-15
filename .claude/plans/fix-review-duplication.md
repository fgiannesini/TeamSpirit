# Fix Review duplication on multi-turn reviews

## Contexte

### Bug observé

Quand une user story reste en état `Review` sur plusieurs tours de simulation, elle apparait **dupliquée** dans l'UI : la story est rendue à la fois dans le thread où elle était en `InProgress` (tour précédent) ET dans le thread qui la review (tour courant). La duplication persiste tant que la story n'est pas `Done`.

### Trace data flow — InProgress (t=1, thread 0) → Review (t=2, thread 1) → Review (t=3, thread 1) → Done (t=4, thread 1)

État de l'UI tour par tour avec le code actuel (`src/front/play/play.vue`) :

**Tour 1** — `inProgressEvent({ threadId: 0, userStoryId: 0 })`
- `handleInProgress(thread=0)` : pull story 0 du backlog → push dans `thread0.inProgressStories`.
- Fin de tour : `thread0.inProgressStories = [story0]`, `thread1.reviewStories = []`.

**Tour 2** — `reviewEvent({ threadId: 1, userStoryId: 0 })`
- Garde ligne 302 : `thread1.reviewStories.some(s => s.id === 0)` = false → `handleReview` programmé.
- `handleReview(thread=1)` :
  - Ligne 217 : `thread1.inProgressStories.splice(0)` — vide thread1 (était déjà vide).
  - Ligne 219 : `findStoryById(0)` — trouve story0 dans `thread0.inProgressStories` (pas dans backlog).
  - Ligne 221 : `backlogStories.indexOf(story)` = -1 → **pas de retrait** de l'emplacement courant.
  - Ligne 224 : `thread1.reviewStories.push(story0)` — ajoute la même référence.
- Fin de tour : `thread0.inProgressStories = [story0]` ET `thread1.reviewStories = [story0]`. **Story0 rendue 2 fois dans l'UI.**

**Tour 3** — `reviewEvent({ threadId: 1, userStoryId: 0 })`
- Garde ligne 302 : `thread1.reviewStories.some(s => s.id === 0)` = **true** → `handleReview` skip.
- Aucune mutation. État inchangé.
- Fin de tour : `thread0.inProgressStories = [story0]` ET `thread1.reviewStories = [story0]`. **Toujours dupliquée.**

**Tour 4** — `doneEvent({ threadId: 1, userStoryId: 0 })`
- `handleDone` → `moveStoryFromThreadsTo(0, doneStories)` : itère tous les threads, splice de `thread0.inProgressStories` ET de `thread1.reviewStories`, push dans `doneStories`.
- Fin de tour : `doneStories = [story0]`. État cohérent à nouveau.

**Conclusion** : la duplication apparait dès qu'un évènement `Review` arrive pour une story située dans `inProgressStories` d'un autre thread, et persiste jusqu'au `Done`.

### Évènements émis par la simulation pour un review multi-tours

Vérifié dans `src/simulate/simulation-time.ts` :

- `Review` event est émis par chaque thread qui passe par la branche ligne 53 (`['ToReview', 'Review'].includes(userStory.state)`). À chaque tour où le reviewer continue son review, **un nouveau `Review` event** est émis (ligne 55 : `events.push(createTimeEvent(time, review, thread.id))`).
- Donc oui, la simulation émet un `Review` event **à chaque tour** tant que la story reste en review, pas seulement à la transition.
- `userStoriesWithSomeReviews` (ligne 80-83) peut aussi émettre un `ToReview` event additionnel pour les stories partiellement reviewées.

### Cause racine

`handleReview` dans `play.vue` (lignes 211-227) ne nettoie pas l'emplacement courant de la story avant de la pousser dans `thread.reviewStories`. Il ne traite QUE le cas où la story est dans `backlogStories` (lignes 221-222). Si la story est dans `inProgressStories` ou `reviewStories` d'un autre thread, elle reste à son ancien emplacement → duplication visuelle.

De plus, `thread.inProgressStories.splice(0)` ligne 217 est exécuté **avant** `findStoryById`, ce qui pose un **second problème** : si la même story est dans `thread.inProgressStories` du thread reviewer (même thread continue en review), elle est perdue car splice la supprime, puis `findStoryById` la cherche en vain.

### Comportement attendu

Une story en `Review` doit apparaître exactement dans les `reviewStories` du/des thread(s) reviewer(s) — pas dans les `inProgressStories` d'aucun thread.

Une story reviewée par plusieurs threads en parallèle doit toujours apparaître dans les `reviewStories` de chaque reviewer (comportement déjà couvert par le test `Should move userStories to the corresponding threads when reviewed by several threads`, ligne 596-626 de `play.test.ts`). **Le fix ne doit pas casser ce cas.**

### Stratégie de fix

Dans `handleReview` :
1. Récupérer la référence story **avant** toute mutation (`findStoryById`).
2. Retirer la story de tous les `inProgressStories` (de n'importe quel thread) — car une story en review n'est plus en cours de développement.
3. Retirer la story du backlog (cas où elle vient du backlog en état `ToReview`).
4. **Ne pas** retirer la story des `reviewStories` des autres threads — c'est le comportement intentionnel multi-reviewer.
5. Pousser la story dans `thread.reviewStories` (la garde ligne 302 empêche le double-push pour le même thread).

Le splice ligne 217 (`thread.inProgressStories.splice(0)`) devient redondant avec l'étape 2 généralisée. À supprimer ou à transformer en "déplacer les autres inProgress vers backlog" comme le fait `handleInProgress` (lignes 195-199) — à décider selon le comportement souhaité quand le thread reviewer avait d'autres stories en progress simultanément (cas marginal).

## Tâches

### Tâche 1 — Test de reproduction du bug (cross-thread)

**Fichier**: `src/front/play/play.test.ts`

**Code** :
- Ajouter dans `describe('User story')` un test `Should not duplicate story when transitioning from in-progress to review by another thread`.
- Setup :
  ```ts
  timeEvents: [
    inProgressEvent({ time: 1, threadId: 0, userStoryId: 0 }),
    reviewEvent({ time: 2, threadId: 1, userStoryId: 0 }),
  ],
  structureEvents: [createThread0(), createThread1(), createUserStory({ id: 0 })],
  ```
- Action : `await wrapper.get('[data-testid=compute-all]').trigger('click'); await vi.runAllTimersAsync();`
- Assertions :
  - `wrapper.get('[data-testid=thread-user-story-0]').find('[data-testid=user-story-0-0]').exists() === false` — plus dans thread0.
  - `wrapper.get('[data-testid=thread-user-story-1]').find('[data-testid=user-story-0-1]').exists() === true` — bien dans thread1.
  - `wrapper.findAll('[data-flip-id="story-0"]').length === 1` — exactement une carte rendue.

**Attendu** : ce test **doit échouer** sur le code actuel (la story est dans thread0.inProgressStories ET thread1.reviewStories → 2 cartes).

**Vérification** :
```
npm run type-check
npx vitest run src/front/play/play.test.ts -t "Should not duplicate story when transitioning"
```

---

### Tâche 2 — Test de reproduction du bug (multi-tours)

**Fichier**: `src/front/play/play.test.ts`

**Code** :
- Ajouter `Should not duplicate story across multi-turn review after in-progress` dans le même describe.
- Setup reproduisant la trace du bug :
  ```ts
  timeEvents: [
    inProgressEvent({ time: 1, threadId: 0, userStoryId: 0 }),
    reviewEvent({ time: 2, threadId: 1, userStoryId: 0 }),
    reviewEvent({ time: 3, threadId: 1, userStoryId: 0 }),
    doneEvent({ time: 4, threadId: 1, userStoryId: 0 }),
  ],
  structureEvents: [createThread0(), createThread1(), createUserStory({ id: 0 })],
  ```
- Action : avancer 4 fois (`compute` + `runAllTimersAsync` à chaque tour, 4 fois) ou un seul `compute-all`.
- Assertions intermédiaires après tour 3 :
  - `wrapper.findAll('[data-flip-id="story-0"]').length === 1` — pas de doublon.
  - `wrapper.get('[data-testid=thread-user-story-1]').find('[data-testid=user-story-0-1]').exists() === true`.
  - `wrapper.get('[data-testid=thread-user-story-0]').find('[data-testid=user-story-0-0]').exists() === false`.
- Assertion finale après tour 4 :
  - `wrapper.get('[data-testid=done]').find('[data-testid=user-story-0]').exists() === true`.

**Attendu** : test échoue sur le code actuel (duplication aux tours 2 et 3).

**Vérification** :
```
npm run type-check
npx vitest run src/front/play/play.test.ts -t "Should not duplicate story across multi-turn"
```

---

### Tâche 3 — Test de non-régression : same-thread InProgress → Review ne perd pas la story

**Fichier**: `src/front/play/play.test.ts`

**Code** :
- Ajouter `Should move story to review when same thread transitions from in-progress to review`.
- Setup :
  ```ts
  timeEvents: [
    inProgressEvent({ time: 1, threadId: 0, userStoryId: 0 }),
    reviewEvent({ time: 2, threadId: 0, userStoryId: 0 }),
  ],
  structureEvents: [createThread0(), createUserStory({ id: 0 })],
  ```
- Action : `compute-all` + `runAllTimersAsync`.
- Assertions :
  - `wrapper.findAll('[data-flip-id="story-0"]').length === 1`.
  - `wrapper.get('[data-testid=thread-user-story-0]').find('[data-testid=user-story-0-0]').exists() === true` — toujours rendue.
  - `wrapper.get('[data-testid=thread-state-0]').text() === 'Review'`.

**Attendu** : test échoue sur le code actuel (la story est perdue car `thread.inProgressStories.splice(0)` retire la story avant `findStoryById`).

**Vérification** :
```
npm run type-check
npx vitest run src/front/play/play.test.ts -t "Should move story to review when same thread"
```

---

### Tâche 4 — Fix `handleReview` dans `play.vue`

**Fichier**: `src/front/play/play.vue`

**Code** — remplacer `handleReview` (lignes 211-227) par :

```ts
const handleReview =
  (event: TimeEvent): (() => void) =>
  () => {
    const thread = threads.find((t) => t.id === event.threadId);
    if (!thread) return;

    const story = findStoryById(event.userStoryId);
    if (!story) {
      setThreadState(event.threadId, 'Review');
      return;
    }

    // Retirer la story du backlog si elle y est.
    const backlogIdx = backlogStories.indexOf(story);
    if (backlogIdx !== -1) backlogStories.splice(backlogIdx, 1);

    // Retirer la story de toutes les listes inProgressStories : une story en review
    // n'est plus en développement (peu importe quel thread la portait).
    for (const t of threads) {
      const idx = t.inProgressStories.indexOf(story);
      if (idx !== -1) t.inProgressStories.splice(idx, 1);
    }

    // Ne pas retirer des reviewStories des autres threads — comportement intentionnel
    // multi-reviewer (cf. test `Should move userStories to the corresponding threads
    // when reviewed by several threads`).
    if (!thread.reviewStories.some((s) => s.id === event.userStoryId)) {
      thread.reviewStories.push(story);
    }

    setThreadState(event.threadId, 'Review');
  };
```

**Notes** :
- Ordre du `findStoryById` avant toute mutation : corrige le bug "same-thread in-progress → review" (tâche 3).
- Boucle de retrait sur `inProgressStories` de tous les threads : corrige le bug "cross-thread duplication" (tâches 1 et 2).
- La condition `!thread.reviewStories.some(...)` est défensive : équivalente à la garde ligne 302, mais évaluée au moment de la mutation (plus robuste à l'ordre de partitionnement).
- La garde ligne 302 dans `processEvents` peut rester telle quelle (double protection sans impact) **ou** être simplifiée en `mutations.push(handleReview(event));` direct. Préférer **garder la garde existante** pour éviter de modifier deux endroits dans le même fix — minimiser la surface de changement.

**Vérification** :
```
npm run type-check
npx vitest run src/front/play/play.test.ts
npm run format
```

Attendu : les 3 nouveaux tests (tâches 1, 2, 3) passent, tous les tests existants passent (notamment `Should move userStories to the corresponding threads when reviewed by several threads` et `Should keep two reviews when reviews last`).

---

### Tâche 5 — Test de non-régression : parallel reviewers continuent de fonctionner

**Fichier**: `src/front/play/play.test.ts`

**Code** :
- Vérifier que le test existant `Should move userStories to the corresponding threads when reviewed by several threads` (ligne 596) passe toujours après le fix.
- Vérifier que `Should keep two reviews when reviews last` (ligne 691) passe toujours.
- Si l'un des deux échoue, c'est que la boucle "retirer des inProgressStories de tous les threads" a un effet de bord sur les reviewStories — investiguer.

**Action** : aucune nouvelle écriture, juste vérifier que la suite existante passe.

**Vérification** :
```
npx vitest run src/front/play/play.test.ts
```

Attendu : 83 tests existants + 3 nouveaux = 86 tests, tous verts.

## Vérification par tâche

Après chaque tâche :
- `npm run type-check` — aucune erreur TS.
- `npx vitest run src/front/play/play.test.ts` — tous les tests passent (pour les tâches 1, 2, 3, le nouveau test échoue tant que la tâche 4 n'est pas faite).
- `npm run format` — après la tâche 4.

Ordre strict : tâches 1 → 2 → 3 (tests rouges) → tâche 4 (fix, tests passent) → tâche 5 (vérification globale).
