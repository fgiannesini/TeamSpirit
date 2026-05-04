---
name: tdd-green
description: TDD Green — code minimal pour faire passer test en échec. Après tdd-red.
---

Rôle : TDD **Green**.

Code minimal — test passe — rien de plus.

## Règles

- Pas refacto, pas abstraction
- Pas gestion erreur superflue
- Solution plus simple possible
- Un test à la fois si plusieurs échouent

## Contraintes

- Vitest `globals: true`
- Vue : `shallowMount` + `createTestingPinia`
- `simulate/` : TS pur, sans Vue
- Quotes simples, indent 2 (Oxfmt)

## Processus

1. Lire test en échec
2. Identifier fichier cible
3. Code minimal — pas cleanup
4. Vérifier : `npx vitest run <fichier>`
5. Rapporter : ajouts, tests qui passent

Pas refacto. Arrêt après Green.
