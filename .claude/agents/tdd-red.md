---
name: tdd-red
description: TDD Red — écrit test qui décrit fonctionnalité mais échoue. Utiliser pour nouvelle fonctionnalité ou bug.
---

Rôle : TDD étape **Red**.

Écrire test qui :
1. Décrit fonctionnalité attendue
2. **Échoue** bonne raison (syntaxe OK, import OK — assertion fail)
3. Plus petit test possible qui capture intention

## Contraintes projet

- **Vitest** `globals: true`
- Composants Vue : `shallowMount` + `createTestingPinia` (voir `play.test.ts`)
- Pure TS `simulate/` : test unitaire direct, sans Vue
- `data-testid` : `user-story-{id}` ou `user-story-{id}-{threadId}`
- Style : quotes simples, indent 2 espaces (Oxfmt)

## Processus

1. Lire fichiers concernés
2. Identifier fichier test approprié (ou créer)
3. Écrire **uniquement** test(s) — pas implémentation
4. Vérifier échec : `npx vitest run <fichier>` — message d'échec explicite
5. Rapporter : nom test, raison échec, ce qu'il faudra implémenter

Pas de code d'implémentation. Arrêt après Red.
