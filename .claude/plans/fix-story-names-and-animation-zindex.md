# Plan : Fix Story Names + Animation Z-Index

## Bug 1 — Identical user story names

**Root cause**: `src/front/form-store.ts` creates `todo()` without passing `name`. Default in `src/simulate/factory.ts` is `'user-story'` for all. Result: all stories displayed in `play.vue` have same name.

**Fix**: pass `name: \`US-${index}\`` in random mode (line ~189) and `name: \`US-${id}\`` in selected mode (line ~204).

**Files**:
- `src/front/form-store.ts` — two `todo(...)` calls in `toSimulationInputs()`
- No tests to write (visual render, not unit-testable logic)

**Verification**:
```
npm run type-check
npx vitest run
npm run format
```

---

## Bug 2 — Stories pass under card during FLIP animation

**Root cause**: during GSAP FLIP animation across columns (ex: story returning from thread to backlog), animated element stays in its DOM container (thread) but moves visually to backlog column. Without `position: relative` + high `z-index` on animated element, it passes behind articles in other columns.

**Fix**:
1. CSS: add `position: relative` to `.story-card` in `<style scoped>` of `src/front/play/play.vue` — activates z-index behavior.
2. Script: in `animateFromPositions`, add `zIndex: 100, position: 'relative'` in `from` of GSAP `fromTo`, and `clearProps: 'zIndex,position'` in `to` — elevates card during animation, cleans up after.

```ts
tl.fromTo(
  el,
  { x: dx, y: dy, zIndex: 100, position: 'relative' },
  { x: 0, y: 0, duration: durationMs / 1000, ease: 'power1.inOut', clearProps: 'zIndex,position' },
  0,
);
```

**Files**:
- `src/front/play/play.vue` — `animateFromPositions` (line ~77-95) + `.story-card` CSS
- No Vitest test (GSAP animation not observable in jsdom)

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
npm run format
```
Visual verification in browser via `npm start`.

---

## Order

- Bug 1 (names) then Bug 2 (z-index)
- Independent, can be done in any order

---

## Tasks

- [ ] Bug 1: Update story names in form-store.ts
- [ ] Bug 1: Verify type-check, vitest, format
- [ ] Bug 2: Add position: relative to .story-card CSS
- [ ] Bug 2: Add zIndex/position to animateFromPositions
- [ ] Bug 2: Verify type-check, vitest, format
- [ ] Visual verification in browser
