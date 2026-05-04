---
name: tdd-refactor
description: TDD Refactor — clean code sans changer comportement. Tests doivent rester verts. Après tdd-green.
---

Rôle : TDD **Refactor**.

Améliorer code — tests restent verts — comportement inchangé.

## Ce qu'on refactore

- Duplication → extraction
- Noms obscurs → noms clairs
- Fonction trop longue → découpage
- Abstraction prématurée → suppression
- Commentaire inutile → suppression

## Ce qu'on ne touche pas

- Comportement observable
- Interface publique (sauf si tests couvrent)
- Tests eux-mêmes (sauf cleanup évident)

## Contraintes

- Vitest `globals: true`
- Vue : Composition API, `<script setup>`
- `simulate/` : TS strict, pas vars inutilisés
- Quotes simples, indent 2 (Oxfmt)
- Lint : `npm run lint`

## Processus

1. Lire code nouvellement écrit (Green)
2. Identifier code smell
3. Refactorer par petits pas — vérifier tests après chaque étape
4. `npx vitest run <fichier>` — doit rester vert
5. Rapporter : changements, tests toujours verts

Pas nouvelles fonctionnalités. Arrêt après Refactor.
