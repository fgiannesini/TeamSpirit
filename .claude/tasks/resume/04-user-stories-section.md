---
tags: [afk]
depends_on: [03]
files:
  - src/front/resume/resume.vue
  - src/front/resume/resume.test.ts
---

# 04 — Section User stories

## Code

`src/front/resume/resume.vue`. Calquer la section Bugs (tâche 03), sans la date.

```
<resume-section icon="book_4" label="User stories" :mode="formStore.userStoriesMode" mandatory
                data-testid="user-stories-mode">
  <span class="chip" v-for="userStory in formStore.userStories" :key="userStory.id"
        :data-testid="'user-story-' + userStory.id">
    <span :data-testid="'user-story-label-' + userStory.id">
      US {{ userStory.id }} — {{ userStory.complexity }}/{{ userStory.reviewComplexity }}/{{ userStory.priority }}
    </span>
    <div class="tooltip bottom" :data-testid="'user-story-tooltip-' + userStory.id">
      Complexité {{ userStory.complexity }} · Review {{ userStory.reviewComplexity }} · Priorité {{ userStory.priority }}
    </div>
  </span>
</resume-section>
```

Section **`mandatory`**, comme Équipe : `user-stories.vue` passe `mandatory: true` à son `selector`. Elle reste donc visible avec la chip `Not set` tant que rien n'est saisi — c'est le signal à l'utilisateur qu'il devra la remplir.

## Tests

`src/front/resume/resume.test.ts`, dans un `describe('User stories')`. Données : `userStory()` (defaults `complexity: 3, reviewComplexity: 2, priority: 1`) et `userStory({ id: 1, complexity: 5, reviewComplexity: 3, priority: 2 })`.

- Should display the user stories mode (prop `mode` du `resume-section` `[data-testid=user-stories-mode]`)
- Should display the user stories (assertion structurelle sur la collection projetée des labels : `['US 0 — 3/2/1', 'US 1 — 5/3/2']`)
- Should explain the user story values in a tooltip (`[data-testid=user-story-tooltip-0]` → `Complexité 3 · Review 2 · Priorité 1`)

## Vérif

```bash
npm run type-check
npx vitest run src/front/resume/
```
