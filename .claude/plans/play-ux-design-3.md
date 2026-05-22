# Play UX Design v3

## Contexte

Page `src/front/play/play.vue` — kanban 3 colonnes (Backlog / Threads / Done). Couvert par `src/front/play/play.test.ts` (98 tests).

### Existant

- Layout : `grid kanban` avec 3 colonnes égales `s12 m4` (BeerCSS).
- Cards story : `row middle-align small-padding round border surface-variant` + variante `--review` (border secondary), `--done` (border primary).
- Threads : `border round small-padding` + classes d'état `thread--develop` (primary-container) / `thread--review` (secondary-container) / Wait (rien).
- Chip d'état thread : `primary` (Develop), `secondary` (Review), `''` (Wait/Off).
- Top nav : `top surface-container` une seule ligne (back, progress, timer, time, lead time, team type, loader, play next, play all).
- Empty states : Backlog et Done ont leurs blocs `*-empty` avec icône `extra` + texte plat.
- Test infrastructure : `shallowMount` + `createTestingPinia`, queries via `[data-testid]`. **Important : préserver tous les `data-testid` existants** (`thread-state-0`, `user-story-0`, `story-name`, etc.) — beaucoup de tests les utilisent.

### Causes racines design

1. **Proportions égales** → Threads (lieu de l'action) noyé entre Backlog et Done. Done vide = grand espace mort.
2. **Densité faible** → padding et gaps généreux sur cards basses (juste nom + chip priorité) → impression de cards "ballonnées".
3. **Headers de colonne plats et trop collés au contenu** → `<nav>` sans fond distinct ET sans séparation (border-bottom ou margin) → frontière header/contenu invisible, contenu colle au titre.
4. **État Wait inexpressif** → pas de couleur, pas d'icône → visuellement = un simple compteur.
5. **Chip d'état thread ressemble à un bouton** → `border + round` rectangulaire suggère cliquable (affordance trompeuse) au lieu d'un badge de statut.
6. **Thread idle vide non marqué** → header thread (nom) sans séparation avec zone story, zone vide sans hauteur réservée → texte flotte, contenu décentré perçu, et apparition d'une US **agrandit la card** (saut de hauteur visible) → glitch animation.
7. **Header thread non marqué** → nom "Developer 0" = simple texte aligné, indistinct du contenu → manque hiérarchie titre/corps.
8. **Priorité plate** → flag + chiffre identique pour priorité 1 et 10 → pas de hiérarchie visuelle.
9. **Done vide froid** → hourglass + "No story completed yet" → pas de référence au volume cible.
10. **Top nav encombrée** → tout sur une ligne sans groupement → cognitive load.

### Contraintes

- BeerCSS Material Design 3 prioritaire (chercher classes existantes avant CSS custom).
- Préserver `data-testid` et structure DOM testée.
- Préserver attribut `data-flip-id` sur stories (animation GSAP).
- Préserver classes `thread`, `off`, `primary`, `secondary`, `priority-flash`, `story-card`, `priority-{n}` testées.
- Préserver `surface-variant` sur cards backlog/in-progress (style Material).
- Quotes simples + indent 2 (Oxfmt), commentaires/UI français.

## Tâches

### 1. [ ] Augmenter proportion colonne Threads — `play.vue`

- **Changement** : `grid kanban` → Backlog `s12 m3`, Threads `s12 m6`, Done `s12 m3`. Threads devient zone visuellement dominante (moteur de l'action).
- **Tests à ajouter** dans `play.test.ts` (nouveau `describe('Column proportions')`) :
  - `Should give backlog column m3 width class`
  - `Should give threads column m6 width class`
  - `Should give done column m3 width class`
- **Risque** : reflow visible sur écran moyen. Atténué par `s12` sur petit écran (déjà stacké).

### 2. [ ] Header de colonne marqué et détaché du contenu — `play.vue`

- **Problème** : header `<nav>` plat colle aux cards (pas de séparation visuelle).
- **Changement** :
  - Ajouter classe `surface-container-high` sur les `<nav>` à l'intérieur de chaque `article` (Backlog, Threads, Done). Optionnel : `padding` léger.
  - Ajouter une **séparation visuelle** entre header et liste : `<style scoped>` `.kanban article > nav { border-bottom: 1px solid var(--outline-variant); margin-bottom: 0.75rem; padding-bottom: 0.5rem; }`. Ainsi header se détache du contenu.
- Garder icône + titre `h6` + chip compteur intacts (testid `backlog-count`, `threads-count`, `done-count`).
- **Tests à ajouter** :
  - `Should apply surface-container-high to backlog nav`
  - `Should apply surface-container-high to threads nav`
  - `Should apply surface-container-high to done nav`
- **Note** : si BeerCSS n'a pas la classe utile, fallback `<style scoped>` complet (background + border-bottom + margin-bottom).

#### 2.a [ ] Arrondir le coin haut du header — CSS scoped

- **Problème** : header `<nav>` à coins droits dans un `article` arrondi → ne suit pas la forme du conteneur, paraît plaqué.
- **Décision technique** :
  - **BeerCSS n'offre pas de classe utilitaire adéquate** :
    - `.round` = `border-radius: 2rem` (trop, header devient ovale).
    - `.small-round` = `border-radius: 0.5rem` (acceptable comme valeur, mais s'applique aux 4 coins → casse l'alignement avec le `border-bottom`).
    - `.top-round` applique `border-start-start-radius/border-start-end-radius: var(--_round, 2rem)` → 2rem par défaut, trop. Pas combinable avec `.small-round` (qui ne définit `--_round` que sur l'élément lui-même via `.round, [class*=-round]`).
  - **Solution retenue** : CSS scoped sur la règle existante `.kanban article > nav`.
- **Changement** : étendre la règle scoped existante :
  ```css
  .kanban article > nav {
    border-bottom: 1px solid var(--outline-variant);
    margin-bottom: 0.75rem;
    border-radius: 0.5rem 0.5rem 0 0;
  }
  ```
  - Valeur `0.5rem` aligne avec `.small-round` BeerCSS (cohérence).
  - Top-left + top-right uniquement → préserve la séparation visuelle créée par `border-bottom`.
- **Tests à ajouter** : aucun (style scoped, cosmétique).
- **Vérification** : visuel uniquement.
- **Risque** : si l'`article` parent a un `border-radius` plus grand, léger décalage visuel — acceptable car header reste à l'intérieur.

#### 2.b [ ] Compteur de colonne : badge non-cliquable au lieu de chip — `play.vue`

- **Problème** : `<span class="chip" data-testid="backlog-count">` ressemble à un bouton :
  - `.chip` (beer.css L1407) applique `border: 0.0625rem solid var(--outline-variant)` + `border-radius: 0.5rem` → apparence pill avec bordure visible.
  - `.chip` (beer.css L1040/L1059) partage le ripple wave hover/focus avec `.button` → effet visuel "cliquable" au survol.
  - Affordance trompeuse : utilisateur peut croire qu'on filtre/trie au clic.
- **Décision technique** :
  - **`<span class="badge">` (beer.css L1105) inadapté** : `position: absolute`, couleurs `var(--error)` (rouge), conçu comme badge de notification flottant sur une icône — pas comme compteur standalone.
  - **`<span class="chip fill">` insuffisant** : `.chip.fill` (L1441) ne retire que la bordure. Le ripple hover persiste (même règle L1040).
  - **Solution retenue** : retirer la classe `chip` et créer une classe locale `.column-count` dans `<style scoped>` qui rend un pill plat, sans hover effect.
- **Changement** :
  - HTML : remplacer `<span class="chip" data-testid="backlog-count">…</span>` par `<span class="column-count" data-testid="backlog-count" aria-label="…">…</span>` pour les 3 compteurs (`backlog-count`, `threads-count`, `done-count`).
  - Ajouter `aria-label` explicite pour clarifier sémantique de compteur statique (ex: `aria-label="Backlog story count"`).
  - CSS scoped :
    ```css
    .column-count {
      display: inline-flex;
      align-items: center;
      padding: 0 0.625rem;
      block-size: 1.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--on-surface-variant);
      background-color: var(--surface-container-highest);
      border-radius: 0.75rem;
      user-select: none;
    }
    ```
  - Pas de bordure, pas de hover, fond doux (`surface-container-highest`), taille plus petite que `.chip` (1.5rem vs 2rem) → signale clairement "métadonnée statique".
- **Tests à ajouter** dans `describe('Column counter badge')` :
  - `Should not have chip class on backlog-count` (assert `wrapper.get('[data-testid=backlog-count]').classes()` ne contient pas `'chip'`).
  - `Should not have chip class on threads-count`.
  - `Should not have chip class on done-count`.
  - `Should have column-count class on backlog-count` (vérifie nouvelle classe).
- **Préserver** :
  - `data-testid="backlog-count"`, `data-testid="threads-count"`, `data-testid="done-count"` — assertions existantes sur `.text()` (L1646, L1658, L1673, L1691, L1748, L1776 de play.test.ts) restent OK.
  - Texte affiché identique (`{{ count }} stories/story`, `{{ count }} threads`).
  - Aucun handler ajouté (`@click` interdit).
- **Risque** : aucun fonctionnel (tests `.text()` seulement). Visuel : pill plus discret, à valider visuellement contre les chips internes (priorité, état thread) qui restent en `.chip` — la distinction renforce la sémantique (chips = info contextuelle sur card ; column-count = métadonnée header).

### 3. [ ] Chip d'état thread : badge non-cliquable + icône + couleur Wait — `play.vue`

- **Problèmes** : Wait pas de couleur → indistinct ; chip `border round` → ressemble à un bouton.
- **Changement code** :
  - Remplacer `<span class='chip small'>` par un badge non-cliquable plus discret : utiliser BeerCSS `<span class='badge'>` (ou conserver chip mais retirer `border` et passer en `fill` style). Cible : pas de bordure ronde épaisse qui suggère "bouton".
  - `THREAD_STATE_CHIP_COLOR.Wait = 'tertiary'` (au lieu de `''`).
  - Ajouter `role="status"` et `aria-live="polite"` sur le badge pour lecteurs d'écran.
  - Ajouter une icône Material : `pause` (Wait), `code` (Develop), `rate_review` (Review), `power_settings_new` (Off).
  - Constante `THREAD_STATE_ICON: Record<ThreadState | 'Off', string>`.
- **Tests à ajouter** dans `describe('Thread state chip color')` et nouveau `describe('Thread state icon')` :
  - `Should have tertiary class when state is Wait`
  - `Should display pause icon in Wait state`
  - `Should display code icon in Develop state`
  - `Should display rate_review icon in Review state`
  - `Should display power_settings_new icon in Off state`
  - `Should have role="status" on thread state badge`
- **Tests à mettre à jour** : `Should have neither primary nor secondary class when state is Wait` — séparer en 2 tests (primary check + secondary check) ; ajouter test `Should have tertiary class when state is Wait`.
- **Risque** : si on change de `chip` à `badge`, vérifier que les tests `thread-state-0` (assertions sur `.classes()` et `.text()`) tiennent toujours. Préserver `data-testid=thread-state-{id}`.

### 4. [ ] Thread : hauteur réservée constante + indication idle — `play.vue`

- **Problèmes** :
  - Card thread change de hauteur quand une US arrive → saut visuel, mauvaise UX d'animation.
  - Zone vide non marquée → header thread paraît décentré dans son article.
- **Changement** :
  - Forcer `min-height` sur `.thread-stories` correspondant à **la hauteur d'une story card** (~2.5rem). La zone reste constante visible (vide ou pleine).
  - Ajouter `<p v-if="thread.inProgressStories.length === 0 && thread.reviewStories.length === 0 && thread.presence !== 'off'" data-testid="thread-idle-{id}" class="small-text italic center-align" style="opacity: 0.6">No story assigned</p>`.
  - Si `presence === 'off'`, ne rien afficher dans le hint (`off` class opacity 0.5 + chip Off suffisent).
- **Tests à ajouter** dans `describe('Thread idle hint')` :
  - `Should show "No story assigned" hint when thread is Wait and no stories`
  - `Should hide hint when thread has in-progress story`
  - `Should hide hint when thread has review story`
  - `Should hide hint when thread is Off`
- **Note style** : `.thread-stories { min-height: 2.5rem; }` au lieu de `1.5rem`. Tester visuellement la transition (devrait être lisse).

### 5. [ ] Header de thread marqué — séparation titre/contenu — `play.vue`

- **Problème** : nom "Developer 0" = simple texte aligné gauche, indistinct de la zone story.
- **Changement** :
  - Wrapper le `row middle-align` du nom + chip d'état dans un header `.thread-header` avec :
    - `border-bottom: 1px solid var(--outline-variant)` (séparation visuelle avec zone story).
    - `padding-bottom: 0.25rem; margin-bottom: 0.375rem`.
  - Optionnel : nom thread en `<strong>` ou `class="bold"` pour renforcer hiérarchie.
- **Tests à ajouter** dans `describe('Thread header structure')` :
  - `Should wrap thread name and state in a header element` (vérifier classe `thread-header` ou structure).
- **Préserver** : testid `thread-title-{id}`, `thread-state-{id}`.

#### 5.a [ ] Intégrer le header dans la carte thread (anti « boîte flottante ») — `play.vue`

- **Problème** : le `small-padding` (0.5rem) de `.thread` ajoute 0.5rem tout autour de `.thread-header`. Le header n'atteint jamais le bord interne de la carte → effet « bloc posé à l'intérieur » au lieu d'un bandeau intégré. De plus le séparateur `border-bottom: color-mix(... currentColor 35% ...)` dépend de `currentColor` → peu lisible sur `primary-container`/`secondary-container` (texte clair) et faible contraste sur fond neutre Wait.
- **Cause racine** :
  1. Padding global du parent (`small-padding`) qui ne peut pas être annulé sans marge négative (rejetée par l'utilisateur).
  2. Couleur de séparateur non maîtrisée (`currentColor` au lieu d'une couleur de surface/accent opaque).
  3. `border-radius: 2rem` du parent → un header bord-à-bord déborderait des coins sans `overflow:hidden` (à éviter, cf. note FLIP).
- **Contraintes** : pas de marge négative ; pas de nouveau composant ; pas d'`overflow:hidden` (l'animation FLIP pose `position:relative` + transforms sur les `.story-card`, une carte en translation peut sortir temporairement de la carte → risque de clip) ; séparateur droit (« sans arrondi ») et visible sur tous les fonds ; contenu en léger retrait des coins arrondis.
- **Décision technique** :
  - **Marges négatives** : rejetées par l'utilisateur.
  - **`overflow:hidden` sur `.thread`** : rejeté (risque de clip FLIP).
  - **`<hr>` / `<div class="divider">`** : ajoute du markup et le `divider` BeerCSS hérite des mêmes couleurs de surface peu contrastées → n'apporte rien vs `border-bottom`. Rejeté.
  - **Solution retenue** : retirer `small-padding` de `.thread`, redistribuer le padding (header + zone stories gèrent chacun le leur), séparateur à couleur opaque déclinée par état.
- **Changement HTML** : retirer `'small-padding'` de la liste de classes de `.thread` (lignes ~529-537). Structure interne (`.thread-header > .row > span + badge`, `.thread-stories`) **inchangée** → tests structurels conservés.
  ```text
  :class="[
    'thread',
    'border',
    'round',
    thread.presence,
    THREAD_STATE_CLASSES[thread.state].state,
    THREAD_STATE_CLASSES[thread.state].container,
  ]"
  ```
- **Changement CSS scoped** :
  - `.thread { padding: 0; }` (le `.round` reste, pas d'`overflow`).
  - `.thread-header` : séparateur neutre par défaut + retrait latéral léger (contenu pas collé aux coins) :
    ```css
    .thread-header {
      border-bottom: 1px solid var(--outline-variant);
      padding: 0.5rem 0.75rem;
      margin: 0;
    }
    .thread--develop > .thread-header {
      border-bottom-color: var(--primary);
    }
    .thread--review > .thread-header {
      border-bottom-color: var(--secondary);
    }
    ```
  - `.thread-stories` : récupérer le padding porté auparavant par `small-padding` : ajouter `padding: 0.5rem 0.75rem;`.
- **Couleur séparateur (visible sur tous fonds)** : remplacer `currentColor` par des variables opaques, cohérentes avec la bordure d'accent de la carte :
  - Wait/Off (fond neutre) → `var(--outline-variant)` (déjà utilisé par `article > nav`, cohérence).
  - Develop (`primary-container`) → `var(--primary)` (= `.thread--develop` border).
  - Review (`secondary-container`) → `var(--secondary)` (= `.thread--review` border).
  - Le `border-bottom` reste un trait horizontal rectiligne (pas affecté par le `border-radius: 2rem` du parent) → exigence « sans arrondi » satisfaite.
- **Tests** : changement purement CSS/layout (swap de classes + règles de style, aucune logique). Selon mémoire projet « No tests for layout changes » → **aucun nouveau test ni modif**. Tests structurels existants (`play.test.ts` ~2192-2194 : `.thread-header` existe + contient `thread-title-{id}` et `thread-state-{id}`) restent verts car la structure DOM est inchangée.
- **Vérification visuelle (`npm start`)** : header intégré sur les 4 états (Wait, Develop, Review, Off), séparateur visible sur chaque fond, contenu en retrait, trait droit. Si le header déborde des coins arrondis (peu probable car le header n'a pas de background propre, seul le `border-bottom` est visible) ou si le trait paraît trop court → variante : `.thread-header { padding-inline: 0; }` + reporter le retrait latéral sur le `.row` enfant (`padding-inline: 0.75rem;`) pour un trait plus large avec contenu toujours en retrait.

- **Changement** : chip priorité prend classe couleur BeerCSS selon valeur :
  - `priority >= 5` → `primary` (haute)
  - `priority >= 2 && < 5` → `secondary` (moyenne)
  - `priority === 1` → `tertiary` (basse)
  - `null` → pas de chip (inchangé).
- Computed function `priorityChipClass(priority: number | null): string`.
- **Tests à ajouter** dans nouveau `describe('Priority chip color')` :
  - `Should apply primary class to priority 5+`
  - `Should apply secondary class to priority 2-4`
  - `Should apply tertiary class to priority 1`
- **Préserver** : icône flag, aria-label, classe `chip small`, testid `priority-{id}`.

### 6. [ ] Done empty state — référence volume cible + ton positif — `play.vue`

- **Changement** : remplacer texte plat par message dynamique :
  - Calculer `totalStoriesCount = computed(() => structureEvents CreateUserStory count)`.
  - Texte : `"0 of {{ totalStoriesCount }} stories completed"` + sous-texte plus engageant `"Complete stories will land here"`.
  - Icône : remplacer `hourglass_empty` par `flag` (drapeau d'arrivée) ou conserver `hourglass_empty`.
- **Tests à ajouter** dans `describe('Done empty state content')` :
  - `Should show total story count in done empty state`
  - `Should show "Complete stories will land here" subtext`

### 7. [ ] Densifier story cards : afficher id + nom inline — `play.vue`

- **Changement** : dans toutes les cards story (backlog + thread inProgress + thread review + done), afficher `<span class="small-text grey-text">#{{ story.id }}</span>` à gauche du nom (à la place de seulement `title=` attribut). Le nom prend `max`.
- Avantage : id visible sans hover, plus de signal dense.
- Conserver `title="#{id}"` pour le tooltip (compatibilité tests existants).
- **Tests à ajouter** dans nouveau `describe('Story id display')` :
  - `Should display story id "#0" inline in backlog card`
  - `Should display story id "#0" inline in thread in-progress card`
  - `Should display story id "#0" inline in thread review card`
  - `Should display story id "#0" inline in done card`
- **Préserver** : `data-testid=story-name`, `title` attribut (tests `Story id surface` toujours OK).

### 8. [ ] Top nav : groupement logique (back | stats | actions) — `play.vue`

- **Changement** : structurer le `<nav class="top">` en 3 groupes séparés par `<div class="max">` :
  - Groupe gauche : back button + progress bar.
  - Groupe centre (max) : timer icon, time, lead time, team type.
  - Groupe droite : loader, play next, play all.
- Mise en place via wrapping `<div class="row">` ou utilisation `class="max"` BeerCSS pour pousser groupes.
- **Tests à ajouter** : non strictement nécessaire (visuel uniquement), mais ajouter `Should render top nav groups` qui vérifie présence des éléments groupés.
- **Préserver** : tous les `data-testid` et `aria-label` existants.

### 9. [ ] Card story : taper l'écart vertical entre cards — `play.vue` (style scoped)

- **Changement** : `column-stories { gap: 0.5rem }` → `gap: 0.375rem`. `thread-stories { gap: 0.25rem }` → conserver. Réduit espace vertical de 25% sans toucher au padding interne.
- **Vérification** : visuel uniquement.
- **Tests à ajouter** : aucun (style scoped).

### 10. [ ] Done card : check icon vert tertiary au lieu de primary — `play.vue`

- **Changement** : sur la card done (`.story-card--done i`), `color: var(--tertiary)` au lieu de `var(--primary)`. Préfère réutiliser `primary-container` mais avec accent tertiary sur l'icône pour différencier de Develop (qui est primary).
- Alternative : conserver primary container, mais ajouter classe `tertiary-text` BeerCSS sur l'icône (vérifier existence).
- **Tests à ajouter** : aucun (cosmétique, mais on peut tester présence classe couleur sur icône).

### 11. [ ] Story card : icône d'état — `play.vue`

- **Idée** : similaire à l'icône `check_circle` sur les cards Done, ajouter une icône visuelle sur les cards in-progress et review pour renforcer la lecture de l'état.
- **Proposition** :
  - In-progress (thread) : icône `code` (petit, `class="small"`) à gauche du nom
  - Review (thread) : icône `rate_review` à gauche du nom
- **Préserver** : `data-testid=story-name`, `data-flip-id`, classes existantes.
- **Tests à ajouter** : vérifier présence icône sur card in-progress et review.

## Ordre d'implémentation

Tâches **indépendantes** (peuvent être faites dans n'importe quel ordre) :
- 1 (proportions), 2 (header surface), 6 (done empty), 8 (top nav), 9 (gap), 10 (done icon couleur).

Tâches **liées** (un par un, intermède review entre) :
- 3 (Wait expressif) → 4 (thread idle hint) — sémantique état proche.
- 5 (priorité couleur) → 7 (id inline) — touchent la carte story.

**Ordre suggéré** : 1, 2, 8, 9, 3, 4, 5, 7, 6, 10. Du structurel (layout/header/nav) vers le détail (cards, couleurs).

## Vérification par tâche

Après chaque tâche :

```bash
npm run type-check
npx vitest run src/front/play/play.test.ts
npm run format
```

Toutes les commandes doivent passer avant tâche suivante.

## Notes BeerCSS

- Classes couleur Material Design 3 disponibles : `primary`, `secondary`, `tertiary`, `error`, suffixes `-container`, `-text`, `-border`.
- Surface elevations : `surface`, `surface-variant`, `surface-container`, `surface-container-low`, `surface-container-high`, `surface-container-highest`.
- Si une classe BeerCSS n'existe pas pour un usage, fallback `<style scoped>` avec variables CSS Material `var(--tertiary)`, `var(--surface-container-high)` etc.
- Vérifier sur https://www.beercss.com avant CSS custom (consignes CLAUDE.md).
