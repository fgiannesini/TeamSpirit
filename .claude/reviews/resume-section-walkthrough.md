# Walkthrough — `resume-section`

## Pourquoi ce code est nécessaire

Le panneau de résumé de configuration doit afficher, pour chaque section du formulaire (Équipe, Modifications d'équipe, Modifications de priorité, Bugs, User stories), le mode choisi (Random / Custom / Not set) et, en mode Custom, la liste des éléments configurés. Certaines sections (Équipe, User stories) doivent toujours rester visibles même non configurées ; les autres disparaissent tant qu'elles ne sont pas configurées, pour ne pas gaspiller l'espace réduit du panneau (15rem).

## L'histoire

### Afficher l'icône de la section

Le composant reçoit une icône Material Symbols en prop et doit l'afficher dans un `<i>`.

```ts
// src/front/resume/resume-section.test.ts
test('Should render the icon', () => {
  const wrapper = createWrapper();
  expect(wrapper.get('i').text()).toBe('groups');
});
```

Échec initial : `Failed to resolve import "./resume-section.vue"` — le composant n'existe pas encore.

```vue
<!-- src/front/resume/resume-section.vue -->
<script setup lang="ts">
defineProps<{
  icon: string;
}>();
</script>
<template>
  <nav>
    <i>{{ icon }}</i>
  </nav>
</template>
```

### Afficher le libellé de la section

```ts
// src/front/resume/resume-section.test.ts
test('Should render the label', () => {
  const wrapper = createWrapper();
  expect(wrapper.get('.max').text()).toBe('Équipe');
});
```

Échec initial : `Unable to get .max within: <nav label="Équipe" mode="random"><i>groups</i></nav>` — le `label` n'était pas encore rendu.

```vue
<!-- src/front/resume/resume-section.vue -->
<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
}>();
</script>
<template>
  <nav>
    <i>{{ icon }}</i>
    <span class="max">{{ label }}</span>
  </nav>
</template>
```

### Afficher le libellé du mode (Random / Custom / Not set)

```ts
// src/front/resume/resume-section.test.ts
test.each([
  ['random', 'Random'],
  ['custom', 'Custom'],
  ['notSet', 'Not set'],
])('Should display the mode label for %s', (mode, expectedLabel) => {
  const wrapper = createWrapper(mode as SelectorMode);
  expect(wrapper.get('[data-testid=mode]').text()).toBe(expectedLabel);
});
```

`createWrapper` prend maintenant `mode` et `mandatory` en paramètres, avec `mandatory` à `true` par défaut pour que le cas `notSet` reste observable indépendamment du masquage (voir étape suivante).

Échec initial : `Unable to get [data-testid=mode] within: <nav mode="random" mandatory="true">...` — le chip de mode n'existait pas.

```vue
<!-- src/front/resume/resume-section.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import type { SelectorMode } from '../form-store.ts';

const props = defineProps<{
  icon: string;
  label: string;
  mode: SelectorMode;
}>();

const modeLabel = computed(() => {
  switch (props.mode) {
    case 'random':
      return 'Random';
    case 'custom':
      return 'Custom';
    case 'notSet':
      return 'Not set';
  }
});
</script>
<template>
  <nav>
    <i>{{ icon }}</i>
    <span class="max">{{ label }}</span>
    <span class="chip" data-testid="mode">{{ modeLabel }}</span>
  </nav>
</template>
```

### Masquer la section quand le mode est notSet et qu'elle n'est pas obligatoire

```ts
// src/front/resume/resume-section.test.ts
test('Should not render anything when mode is notSet', () => {
  const wrapper = createWrapper('notSet', false);
  expect(wrapper.find('nav').exists()).toBe(false);
});
```

Échec initial : `expected true to be false` — le `<nav>` était toujours rendu, il n'y avait pas encore de garde sur `mandatory`/`mode`.

```vue
<!-- src/front/resume/resume-section.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import type { SelectorMode } from '../form-store.ts';

const props = defineProps<{
  icon: string;
  label: string;
  mode: SelectorMode;
  mandatory?: boolean;
}>();

const modeLabel = computed(() => {
  switch (props.mode) {
    case 'random':
      return 'Random';
    case 'custom':
      return 'Custom';
    case 'notSet':
      return 'Not set';
  }
});
</script>
<template>
  <template v-if="mandatory || mode !== 'notSet'">
    <nav>
      <i>{{ icon }}</i>
      <span class="max">{{ label }}</span>
      <span class="chip" data-testid="mode">{{ modeLabel }}</span>
    </nav>
  </template>
</template>
```

### Afficher le slot d'éléments en mode custom

```ts
// src/front/resume/resume-section.test.ts
test('Should render the slot content when mode is custom', () => {
  const wrapper = shallowMount(ResumeSection, {
    props: { icon: 'groups', label: 'Équipe', mode: 'custom' },
    slots: { default: '<span data-testid="slot-content">Dev 0</span>' },
  });
  expect(wrapper.find('[data-testid=slot-content]').exists()).toBe(true);
});
```

Échec initial : `expected false to be true` — aucun `<slot>` n'était rendu dans le template.

```vue
<!-- src/front/resume/resume-section.vue -->
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

### Masquer le slot en dehors du mode custom

```ts
// src/front/resume/resume-section.test.ts
test('Should not render the slot content when mode is random', () => {
  const wrapper = shallowMount(ResumeSection, {
    props: { icon: 'groups', label: 'Équipe', mode: 'random' },
    slots: { default: '<span data-testid="slot-content">Dev 0</span>' },
  });
  expect(wrapper.find('[data-testid=slot-content]').exists()).toBe(false);
});
```

Ce test est passé du premier coup : `v-if="mode === 'custom'"`, ajouté à l'étape précédente pour l'affichage en mode `custom`, est par construction bidirectionnel — il masque déjà le slot dans tous les autres modes. Le cas (mode `random` + slot renseigné) n'était vérifié par aucun test existant, ce n'est donc pas une redondance avec le test précédent (comportement distinct : absence, pas présence) ; conservé comme filet de non-régression explicite plutôt que fusionné, conformément à la tâche qui le liste séparément.

### Refactor

Tous les tests étaient verts (8/8) et `type-check` propre à ce stade. Trois ajustements demandés en relecture :

**1. Typer le tableau `test.each` pour éviter le cast `as SelectorMode`.**

```ts
// src/front/resume/resume-section.test.ts
test.each<[SelectorMode, string]>([
  ['random', 'Random'],
  ['custom', 'Custom'],
  ['notSet', 'Not set'],
])('Should display the mode label for %s', (mode, expectedLabel) => {
  const wrapper = createWrapper(mode);
  expect(wrapper.get('[data-testid=mode]').text()).toBe(expectedLabel);
});
```

**2. Remplacer le `switch` par un `Record<SelectorMode, string>`.**

Le `switch` déclenche un warning oxlint `return-in-computed-property` (oxlint ne prouve pas l'exhaustivité de l'union). Le même `switch`, copié tel quel depuis `resume.vue`, porte le même warning là-bas — mais la tâche 02 (`.claude/tasks/resume/02-team-section.md`) supprime entièrement ce computed de `resume.vue` au profit de `resume-section.vue`. La duplication est donc temporaire (une tâche) : pas d'extraction commune nécessaire, le `Record` n'est appliqué qu'ici.

```vue
<!-- src/front/resume/resume-section.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import type { SelectorMode } from '../form-store.ts';

const props = defineProps<{
  icon: string;
  label: string;
  mode: SelectorMode;
  mandatory?: boolean;
}>();

const modeLabels: Record<SelectorMode, string> = {
  random: 'Random',
  custom: 'Custom',
  notSet: 'Not set',
};

const modeLabel = computed(() => modeLabels[props.mode]);
</script>
<template>
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
</template>
```

**3. Interroger le test « Should not render anything when mode is notSet » par `data-testid` plutôt que par le sélecteur de balise `nav`.**

Toutes les autres assertions du fichier ciblent un `data-testid` ; `wrapper.find('nav')` était l'exception, plus fragile si un autre `<nav>` apparaît dans le composant. Le chip de mode porte déjà `data-testid="mode"`, pas besoin d'en ajouter un nouveau.

```ts
// src/front/resume/resume-section.test.ts
test('Should not render anything when mode is notSet', () => {
  const wrapper = createWrapper('notSet', false);
  expect(wrapper.find('[data-testid=mode]').exists()).toBe(false);
});
```

**4. Trou de couverture sur la branche `mandatory` du `v-if`.**

Aucun test n'exerçait la combinaison `mandatory: false` + `mode !== 'notSet'`. Sans elle, `v-if="mandatory || mode !== 'notSet'"` pouvait être réduit à `v-if="mandatory"` sans qu'aucun test ne casse — vérifié en mutant temporairement le composant, le seul test à échouer était celui-ci :

```ts
// src/front/resume/resume-section.test.ts
test('Should render when mode is not notSet and section is not mandatory', () => {
  const wrapper = createWrapper('random', false);
  expect(wrapper.find('[data-testid=mode]').exists()).toBe(true);
});
```

Échec avec `v-if="mandatory"` : `expected false to be true`. Condition restaurée à `v-if="mandatory || mode !== 'notSet'"` — c'est le comportement qui permet aux sections optionnelles (Bugs, modifications de priorité/équipe) de s'afficher une fois configurées.

**5. `createWrapper` : liste d'arguments positionnels → objet d'options.**

Avec 3 paramètres booléens/chaînes, les appels positionnels (`createWrapper('custom', true, '<span>...</span>')`) devenaient illisibles sans regarder la signature. Passage à un objet d'options nommées avec valeurs par défaut :

```ts
// src/front/resume/resume-section.test.ts
const createWrapper = ({
  mode = 'random',
  mandatory = true,
  slotContent = '',
}: { mode?: SelectorMode; mandatory?: boolean; slotContent?: string } = {}): VueWrapper => {
  return shallowMount(ResumeSection, {
    props: {
      icon: 'groups',
      label: 'Équipe',
      mode,
      mandatory,
    },
    slots: { default: slotContent },
  });
};
```

Tous les appels mis à jour en conséquence, par exemple :

```ts
test('Should render the slot content when mode is custom', () => {
  const wrapper = createWrapper({
    mode: 'custom',
    slotContent: '<span data-testid="slot-content">Dev 0</span>',
  });
  expect(wrapper.find('[data-testid=slot-content]').exists()).toBe(true);
});
```

9/9 tests toujours verts, `type-check` et `oxlint` propres.
