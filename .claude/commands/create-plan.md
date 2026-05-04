---
description: Crée un plan todo dans .claude/plans/ avant toute tâche multi-étapes. Analyser, découper, écrire fichier, s'arrêter. Utiliser avant tdd-red/tdd-green/tdd-refactor.
---

Rôle : créer plan d'exécution. Pas d'implémentation.

## Processus

1. Lire fichiers concernés
2. Identifier tâches — découpage minimal, chaque tâche indépendante et vérifiable
3. Numéroter les tâches (1., 2., 3. …) pour permettre de les lancer par numéro
4. Écrire `.claude/plans/<nom-feature>.md`
5. S'arrêter — rapporter chemin du fichier créé

## Format fichier plan

```markdown
# <titre>

## Tâches

1. [ ] <tâche 1> — `tdd-red` : <ce que le test doit vérifier>
2. [ ] <tâche 2> — `tdd-green` : <ce qu'il faut implémenter>
3. [ ] <tâche 3> — `tdd-refactor` : <ce qu'il faut nettoyer>

## Règles

- Tests verts après chaque tâche
- Pas nouvelles fonctionnalités
```

## Règles découpage

- Chaque tâche = un seul agent (`tdd-red`, `tdd-green` ou `tdd-refactor`)
- Trop gros → redécouper
- Ordre : red → green → refactor par comportement, pas tout red puis tout green
- Si bug : red d'abord (test qui reproduit), puis green

Pas d'exécution. Arrêt après création fichier.
