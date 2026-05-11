# Play page — UX / design improvements

## Context

### Existing

**Main file**: `src/front/play/play.vue` (537 lines, single SFC)

**Layout**:
- Top `<nav>`: `timer` icon, `time` span (`X/maxTime`), "Lead Time" label, value, two buttons "Play next" / "Play All".
- 3-column grid (`s12 m4`): Backlog | Threads | Done.
- Each column = `<article>` with `<nav>` (title + icon + count chip; Threads has no chip).
- Threads: vertical list of `.thread` (header with title + state chip + stories area).

**Shared components**: `src/front/shared/` — `slider.vue`, `selector.vue`, `add-button.vue`, `remove-button.vue`. No reusable card/column component.

**Visual stack**:
- BeerCSS classes used: `grid`, `s12 m4`, `chip`, `chip small`, `max`, `border`, `column`, `row middle-align`, `small-margin`.
- Custom scoped CSS: `.kanban`, `.column-stories`, `.story-card`, `.story-card--review`, `.story-card--done`, `.thread`, `.thread--develop`, `.thread--review`, `.thread-header`, `.thread-stories`, `.off`. Colors via M3 tokens (`var(--primary)`, `var(--secondary)`, `var(--surface-variant)`, `var(--outline-variant)`).
- FLIP animations via GSAP (`data-flip-id`, `captureFlipPositions` + `animateFromPositions`).

**Injected data**: `useFormStore().simulationOutputs[id]` — `{ teamType, structureEvents, timeEvents, statEvents }`.

**Tests**: `src/front/play/play.test.ts` covers threads, user stories, compute, stats. Stable data-testids: `compute`, `compute-all`, `time`, `lead-time`, `backlog`, `threads`, `done`, `thread{id}`, `thread-state-{id}`, `thread-title-{id}`, `thread-user-story-{id}`, `user-story-{id}`, `user-story-{id}-{threadId}`, `story-name`.

**Global header**: `App.vue` renders `<header><h3 class="center-align">Team Spirit</h3></header>` then `<RouterView />`. No breadcrumb / back; the Play page has no return link.

### Language convention

UI strings are in English. Any French strings currently present in the codebase are mistakes (regression from CLAUDE.md mention) and will not be propagated. This plan keeps everything in English.

### Identified UX / design issues

#### Visual hierarchy / readability

1. **Stats unclear** — `timer` icon without a label, `X/maxTime` glued to "— Lead Time :" with poor spacing, `NaN` shown raw at startup (no empty state).
2. **Lead time NaN** — raw display while no stat event fired; should fall back to a placeholder.
3. **No progress bar** — `time/maxTime` is plain text, no visual gauge of simulation progress.
4. **Done / backlog count** — chip with bare number, no context (`12` vs `12 stories`).
5. **Empty states missing** — empty Backlog and Done show a blank panel with no message or icon.

#### Semantics / accessibility

6. **Icon buttons missing aria attributes** — decorative `<i>` (timer, inbox, groups, task_alt) not marked `aria-hidden`; screen readers announce raw icon names.
7. **`aria-live` absent** — time / lead-time stats change dynamically; assistive tech is not notified.
8. **Priority chip ambiguous** — number 1-10 with no `flag` icon or `aria-label`; impossible to know whether 1 = high or low without domain knowledge.
9. **Asymmetric story icons** — `check_circle` only on done; in-progress and review have no icon, breaking visual symmetry.
10. **Wait state visually identical to off** — both look "neutral", users cannot distinguish a thread waiting from a thread off.

#### Domain-meaning gaps

11. **TeamType ignored** — `data.teamType` (Parallel/Ensemble) is loaded but never displayed; user has no idea which mode is playing.
12. **No simulation context** — no link back to /simulate, no run id, no parameters reminder.

#### Animation feedback

13. **No loading indicator** — during the 600 ms animation, the button is disabled but nothing else signals work in progress (no spinner / shimmer).
14. **Priority change is silent** — when a `ChangePriority` event fires, the chip number changes with no visual flash.
15. **State transitions are abrupt** — `.story-card` does not animate `background-color` / `border-color` (only `.thread` does), so review / done flips snap.

#### Custom CSS replaceable by BeerCSS

16. `.story-card` reproduces `<div class="row small-padding round border surface-variant">` BeerCSS utilities.
17. `.thread` reproduces a standard BeerCSS `article` (border, round, padding).
18. `.thread-header` is a flex row with align-middle and margin-bottom — covered by `<nav class="no-padding">` BeerCSS pattern.
19. Color-container variants `--develop`, `--review` can use BeerCSS classes `primary-container` / `secondary-container` directly instead of `var(--primary-container)` rules.

### Strategy

- **No architectural refactor**: no splitting into child components (out of scope for this plan).
- **BeerCSS first**: replace each custom rule with its utility class when one exists; keep custom CSS only for what BeerCSS does not cover (color-change transitions, empty-state layout).
- **Strings in English**: any French string in the existing template (e.g. icon labels, hidden labels) is a mistake — the plan replaces them with English.
- **Preserve all existing data-testid**: tests must continue to pass without rewrite, except where a test asserts a string that this plan deliberately changes (called out in each task).
- **No new animation library**: existing GSAP/FLIP is sufficient; only CSS transitions are added.

### Root cause

Not a bug — the page is functional. The gap is UX polish: hierarchy, empty states, accessibility, animation feedback.

## Tasks

Grouped by theme. Each task is atomic (code + tests verifiable together).

### Layout

#### 1. Sticky toolbar with visual progress

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Toolbar `<nav>`: add BeerCSS classes `top` (sticky) + `surface-container` (opaque on scroll).
- Replace plain `X/maxTime` text with a BeerCSS `<progress>` plus the existing label:
  ```html
  <progress class="max" :value="currentTime" :max="maxTime" data-testid="progress"></progress>
  <span data-testid="time">{{ timeDisplay }}</span>
  ```
- Add `aria-live="polite"` on the `[data-testid=stats]` container so screen readers announce updates.

**Tests**:
- `progress` rendered, `:max` equals `maxTime`, `:value` equals current time after `compute`.
- `aria-live="polite"` present on stats.
- Existing test on `time` text format `'1/1'` still passes.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

#### 2. Empty states for Backlog and Done

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- In `[data-testid=backlog]`: when `backlogStories.length === 0`, render
  ```html
  <div data-testid="backlog-empty" class="center-align padding">
    <i class="extra" aria-hidden="true">inbox</i>
    <p>Backlog is empty</p>
  </div>
  ```
- In `[data-testid=done]`: when `doneStories.length === 0`, render
  ```html
  <div data-testid="done-empty" class="center-align padding">
    <i class="extra" aria-hidden="true">hourglass_empty</i>
    <p>No story completed yet</p>
  </div>
  ```
- Hide `column-stories` when empty (otherwise an empty flex container takes space).

**Tests**:
- `backlog-empty` visible when backlog empty.
- `backlog-empty` hidden when at least one backlog story.
- `done-empty` visible when done empty.
- `done-empty` hidden when at least one done story.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

#### 3. Display teamType

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- `const teamType = data.teamType` (already available on `data`).
- Add a chip in the toolbar:
  ```html
  <span class="chip" data-testid="team-type">{{ teamType }}</span>
  ```
- Optional icon: `groups` for `Parallel`, `hub` for `Ensemble` (computed).

**Tests**:
- `team-type` shows `Parallel` when `teamType === 'Parallel'`.
- `team-type` shows `Ensemble` when `teamType === 'Ensemble'`.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

#### 4. Back button to /simulate

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Import `useRouter` from `vue-router`.
- Prepend to the toolbar:
  ```html
  <button class="transparent circle" data-testid="back-button" aria-label="Back to simulations" @click="router.push('/simulate')">
    <i aria-hidden="true">arrow_back</i>
  </button>
  ```

**Tests**:
- `back-button` rendered with `aria-label="Back to simulations"`.
- Click calls `router.push('/simulate')` (mocked router).

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

### Components

#### 5. Explicit Backlog / Done counts

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Replace bare-number chip:
  ```html
  <span class="chip" data-testid="backlog-count">
    {{ backlogStories.length }} {{ backlogStories.length > 1 ? 'stories' : 'story' }}
  </span>
  ```
- Same for `done-count`.

**Tests**:
- `backlog-count` shows `0 story` when empty.
- `backlog-count` shows `1 story` for one story.
- `backlog-count` shows `2 stories` for many.
- `done-count` shows `0 story` when empty.
- `done-count` shows `2 stories` for two completed stories.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

#### 6. Threads count and sort by activity

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Add a chip in the Threads `<nav>`:
  ```html
  <span class="chip" data-testid="threads-count">{{ threads.length }} threads</span>
  ```
- Add a `computed sortedThreads` ordering threads: `Develop` and `Review` first, then `Wait`, then `off` last. Keep stable order (`id` ASC) within a group.
- Replace `v-for="thread in threads"` with `v-for="thread in sortedThreads"`.

**Tests**:
- `threads-count` shows `2 threads` with two threads.
- DOM order: a Develop thread comes before a Wait thread.
- DOM order: a Wait thread comes before an off thread.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

#### 7. Priority chip with icon and aria-label

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Replace each priority chip occurrence (there are 4: backlog, in-progress, review, done) with:
  ```html
  <span
    v-if="story.priority !== null"
    class="chip small"
    :data-testid="`priority-${story.id}`"
    :aria-label="`Priority ${story.priority}`"
  >
    <i aria-hidden="true">flag</i>
    <span>{{ story.priority }}</span>
  </span>
  ```
- The numeric span is preserved so `wrapper.get('.chip').text()` still returns `'1'` (existing test ligne 302 / 307).

**Tests**:
- chip has `aria-label="Priority 1"` when priority=1.
- `flag` icon present.
- existing assertion `expect(userStory1.get('.chip').text()).toStrictEqual('1')` still passes.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

#### 8. Thread state chip color

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Bind chip class on the state span:
  - `Develop` → `chip small primary`
  - `Review`  → `chip small secondary`
  - `Wait`    → `chip small` (neutral)
- State text remains in English (`Wait`, `Develop`, `Review`) — no string change, all existing tests pass.

**Tests**:
- when state is Develop, `thread-state-{id}` element classes contain `primary`.
- when state is Review, classes contain `secondary`.
- when state is Wait, classes do not contain `primary` nor `secondary`.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

#### 9. Lead time graceful placeholder

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Replace `leadTime` rendering with a computed:
  ```ts
  const leadTimeDisplay = computed(() => {
    if (leadTime.value === '' || leadTime.value === 'NaN') return '—';
    return leadTime.value;
  });
  ```
- Template uses `{{ leadTimeDisplay }}`.
- The existing test on `lead-time` text `'NaN'` (lines 819–821) must be updated to `'—'`. Document this change in the task PR.

**Tests** (updated):
- Mount with no events: `lead-time` text = `—`.
- Stat event NaN: `lead-time` text = `—` (replaces `NaN`).
- Stat event 0.33: `lead-time` text = `0.33` (unchanged).

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

### Animation feedback

#### 10. Spinner during animation

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Add a BeerCSS circular progress indicator visible only while `computeDisabled === true`:
  ```html
  <progress v-if="computeDisabled" class="circle small" data-testid="loader"></progress>
  ```
- Position: in the toolbar before the compute buttons.

**Tests**:
- `loader` not in DOM at mount.
- after `compute` click and before timers resolve, `loader` exists.
- after `runAllTimersAsync` (final state), `loader` not in DOM.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

#### 11. Smooth color transitions on story-card

**Files**:
- `src/front/play/play.vue` (scoped style only)

**Code**:
- Add to `.story-card`:
  ```css
  transition: background-color 0.3s, border-color 0.3s;
  ```
- Mirrors the existing `.thread` rule so review / done color shifts ease in instead of snapping.
- No JS test (CSS-only, not observable through Vitest jsdom).

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

#### 12. Pulse animation on priority change

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Add a reactive `Set<number>` `flashingStoryIds`.
- In `buildUserStories`, when handling a `ChangePriority` event: add the id, then `setTimeout(() => flashingStoryIds.delete(id), 600)`.
- Bind class on each story card: `:class="{ 'priority-flash': flashingStoryIds.has(story.id) }"`.
- Scoped CSS:
  ```css
  @keyframes priority-flash {
    0%, 100% { background: var(--surface-variant); }
    50% { background: var(--tertiary-container); }
  }
  .priority-flash { animation: priority-flash 0.6s ease-in-out; }
  ```

**Tests**:
- After a `ChangePriority` event is processed, the targeted story card has class `priority-flash`.
- After `vi.advanceTimersByTime(600)`, the class is gone.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

### Accessibility

#### 13. aria-hidden on decorative icons + aria-label on stats

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Mark all decorative `<i>` (timer, inbox, groups, task_alt, fast_forward, play_arrow, flag, check_circle, hourglass_empty, arrow_back when text adjacent) with `aria-hidden="true"`.
- Add `aria-label="Simulation statistics"` on the `[data-testid=stats]` container.

**Tests**:
- `<i>timer</i>` has `aria-hidden="true"`.
- `<i>inbox</i>` has `aria-hidden="true"`.
- `[data-testid=stats]` has `aria-label="Simulation statistics"`.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

#### 14. aria-label on compute buttons

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- `<button data-testid="compute" aria-label="Advance one step">…</button>`
- `<button data-testid="compute-all" aria-label="Run full simulation">…</button>`

**Tests**:
- `compute` has `aria-label="Advance one step"`.
- `compute-all` has `aria-label="Run full simulation"`.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

### CSS cleanup

#### 15. Replace custom CSS with BeerCSS utility classes where possible

**Files**:
- `src/front/play/play.vue` (template + scoped style)
- `src/front/play/play.test.ts`

**Code**:
- Audit `<style scoped>`:
  - `.column-stories` — keep (no direct BeerCSS equivalent for this gap).
  - `.story-card` — keep `class="story-card"` on the element (tests don't depend on it directly, but the class concentrates transitions / variants); remove the `display/align/gap/padding/border/background` declarations and replace with template classes `row middle-align small-padding round border surface-variant` directly. Keep only the `transition` and the `--review` / `--done` rules in scoped CSS.
  - `.story-card--review` / `.story-card--done` — replace inline by toggling BeerCSS container classes (`secondary-container`, `primary-container`) when possible; keep border-color override only if visually needed.
  - `.thread` — same approach: rely on `article` defaults; keep only the variant rules `.thread--develop`, `.thread--review`, `.off` in scoped CSS.
  - `.thread-header` — replace the rule with template class `<nav class="no-padding">`.
- **Preserve all classes asserted in tests**: `thread`, `off`, `thread--develop`, `thread--review`, `story-card` (lines 88, 111, 300, 305).

**Tests**:
- All existing tests still pass without modification.
- No new test required (visual refactor).

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
npm run lint
npm run format:check
```

## Per-task verification

After each task:
- `npm run type-check` — no TS error.
- `npx vitest run src/front/play/play.test.ts` — all tests green.
- `npm run lint` — no Oxlint regression.

## Recommended order

1. Tasks 9 (lead-time placeholder) — small, baseline polish.
2. Tasks 1, 2, 3, 4 (toolbar + empty states + teamType + back) — structural layout.
3. Tasks 5, 6, 7, 8 (counts + sorted threads + priority chip + state color) — components.
4. Tasks 10, 11, 12 (loader + transitions + priority pulse) — animation feedback.
5. Tasks 13, 14 (aria) — can run any time.
6. Task 15 (CSS cleanup) — last; final pass once layout has stabilised.

> Each task is independent; if a BeerCSS class proves missing for one item, skipping to the next task is safe.
