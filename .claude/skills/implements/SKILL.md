---
name: implements
description: Implémente une tâche issue de .claude/tasks/ en TDD strict (red → green → refactor), un test à la fois. S'aligne sur le style, le nommage et le découpage du code existant. Pose une question dès qu'il y a un doute.
---

Entrée : un chemin de tâche (`.claude/tasks/<feature>/03-store-helper.md`), ou un numéro + feature si le contexte est déjà chargé. Si l'entrée est ambiguë, lister les tâches non cochées du dossier et demander laquelle.

## Phase 0 — Charger le contexte

Dans cet ordre :

1. Le fichier de tâche — c'est le contrat. Ni plus, ni moins que ce qu'il demande.
2. Le `00-context.md` du dossier — décisions actées, pattern jumeau.
3. `.claude/CONVENTIONS.md` — conventions du repo.
4. **Le fichier modèle cité dans la tâche** (le calque : `priority-card.vue` pour `bug-card.vue`) **et son test jumeau.** C'est la référence de style, de nommage et de structure. Le lire en entier avant d'écrire une ligne.

Vérifier les `depends_on` : si une tâche dont on dépend n'est pas faite, s'arrêter et le dire.

Créer `.claude/reviews/<nom-tâche>-walkthrough.md` avec l'en-tête (voir Phase 3). Il sera **complété à chaque cycle**, pas à la fin.

## Phase 1 — Boucle TDD

La tâche liste des cas de test. **Un cas à la fois**, jamais deux. Pour chaque cas :

### 🔴 Red

Écrire **un seul** test qui échoue. Le lancer :

```bash
npx vitest run <fichier.test.ts>
```

Vérifier qu'il échoue **pour la bonne raison** — l'assertion, pas un import cassé ou une typo. Un test qui échoue pour une mauvaise raison ne prouve rien : le corriger avant de passer au vert.

Si le test **passe du premier coup**, c'est un signal, jamais un cadeau : soit le cas est déjà couvert par un test plus général (supprimer ce test, il n'apporte rien), soit le code précédent n'était pas minimal. Trancher, et le noter dans le walkthrough.

### 🟢 Green

Écrire **l'implémentation minimale** qui fait passer le test. Minimale veut dire : rien qui ne soit exigé par un test déjà écrit. Pas d'anticipation du cas suivant, pas de généralisation « puisqu'on y est ». Relancer le test — il passe, et les précédents aussi.

### 🔵 Refactor

Avec le filet des tests verts, nettoyer — code **et** test :

- nommage aligné sur le fichier modèle (variables, fonctions, `data-testid`, noms de tests)
- duplication extraite seulement si elle existe déjà en trois exemplaires ailleurs dans le repo (sinon on attend)
- structure identique au calque : mêmes sections, même ordre, mêmes imports groupés
- aucun commentaire, sauf pour une contrainte que le code ne peut pas exprimer

Relancer les tests. Si un test casse pendant le refactor, revenir en arrière — un refactor ne change jamais le comportement.

### 📝 Journaliser

**Immédiatement**, ajouter l'étape au walkthrough : le test écrit, le message d'échec réel, le code minimal ajouté, le refactor s'il y en a eu un. Puis cas suivant.

Écrire au fil de l'eau, jamais de mémoire à la fin : c'est ce qui rend le doc fidèle. Un déroulé reconstitué après coup est une fiction plausible — celui-ci doit être ce qui s'est réellement passé, y compris les tests supprimés, les faux départs et les questions posées.

## Alignement sur l'existant

C'est la règle qui prime sur le goût personnel : **le nouveau code doit être indiscernable de son calque.** Avant d'inventer un nom, une structure ou une abstraction, chercher comment le repo le fait déjà. Si le repo est incohérent sur un point, suivre la majorité et le signaler à la fin — ne pas trancher seul.

## Doutes

Poser la question via `AskUserQuestion`, **une à la fois**, dès que :

- la tâche est ambiguë ou contradictoire avec le code réel
- il faut s'écarter du pattern jumeau
- une décision métier n'est pas tranchée dans `00-context.md`
- la tâche est taguée `review` et le choix d'implémentation n'est pas évident

Ne pas deviner sur une décision produit. Deviner est autorisé uniquement quand le repo donne la réponse — dans ce cas, l'annoncer plutôt que demander.

Tâche taguée `afk` : avancer sans interruption sauf blocage réel.

## Phase 2 — Clôture

Quand tous les cas de la tâche sont verts :

```bash
npm run type-check
npx vitest run <fichier-test-de-la-tâche>
```

Puis cocher la tâche (`[x]`) dans son fichier.

## Phase 3 — Walkthrough

`.claude/reviews/<nom-tâche>-walkthrough.md`, rempli au fil des cycles (Phase 1)

Sert à la relecture humaine : montrer **comment on est arrivé là**, pas seulement où on est arrivé.

```markdown
# Walkthrough — `<nom-tâche>`

## Pourquoi ce code est nécessaire

<Purement fonctionnel : quel besoin utilisateur, quel comportement métier.
Pas de nom de fichier, pas de calque, pas de méta sur le processus ni sur la collaboration —
ça, c'est le rôle de « Ce qu'on a découvert ».>

## L'histoire

### <étape 1 — le besoin le plus simple>

<Le test écrit. Ce qu'il reprochait au code (message d'échec réel).
Le code minimal qui l'a fait passer. Pourquoi ce code et pas plus.>

### <étape N — un comportement distinct par étape>

...

### Refactor

<Ce qui a été restructuré une fois les tests verts, ou « aucun » et pourquoi.>

## Ce qu'on a découvert

<Uniquement ce qui sort du scope de la tâche : incohérence trouvée dans le repo,
test supprimé parce que redondant, fichier jumeau retouché par cohérence,
question qu'il a fallu poser. Omettre la section si rien.>
```

Règles d'écriture :

- une étape par comportement distinct qui a **forcé** du code ; si une étape n'a rien forcé, elle n'existe pas dans le doc parce qu'elle n'aurait pas dû exister dans le code
- chemins exacts (`src/front/form-store.ts:270`)
- pas de jargon : décrire le test puis le code, sans dire « red/green/refactor »
- snippet de code (bloc ```) quand l'étape porte une **règle fonctionnelle** (borne métier, conversion, calcul, condition) — pas pour du pur câblage (import, prop qui ne fait que traverser). Le snippet montre le code final de l'étape, pas un extrait à moitié écrit

## Fin

**Une tâche à la fois.** Ne pas enchaîner sur la suivante sans validation. Ne pas commiter sans qu'on le demande.
