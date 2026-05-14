# Play page — UX / design pass 2 + bug fixes

## Context

### Scope reminder

This plan **follows** `play-ux-design.md` (15 tasks already implemented: sticky toolbar with progress bar, empty states, teamType chip, back button, explicit counts, priority chip with icon/aria, thread state colored chip, lead-time placeholder, spinner, smooth transitions, priority pulse, aria attributes, BeerCSS cleanup). It targets the **three new concerns** raised after that pass:

1. No visual identifier on story cards (only the name shows).
2. Duplication of the same user story in `reviewStories` when several developers review it concurrently.
3. Remaining UX/UI gaps revealed once the previous pass landed.

### Codebase reference points

- **Component**: `src/front/play/play.vue` (701 lines, single SFC).
  - `UserStoryVue = { id: number; name: string; priority: number | null }` — `id` already lives in state but is never rendered.
  - Mutation helpers: `handleTodo`, `handleInProgress`, `handleReview`, `handleToReview`, `handleDone`, `handleIdleThread`, `moveStoryFromThreadsTo`, `findStoryById`, `removeStoryFromItsLocation`.
  - Event dispatcher: `processEvents` partitions events with `partitionParallel` (conflict on same `threadId` or same `userStoryId !== -1`), then runs handlers in batches; idle / `Todo` handlers are **synchronous**, the rest are pushed as deferred mutations executed via `animateBatch`.
  - Story rendering: backlog uses `:key="story.id"` and testid `user-story-{id}`; threads use `:key="story.id"` for in-progress and `:key="'review-' + story.id"` for review, with testid `user-story-{id}-{threadId}`; done uses `:key="story.id"` and testid `user-story-{id}`.
- **Tests**: `src/front/play/play.test.ts` (78 tests, all green). Stable data-testids: `compute`, `compute-all`, `time`, `lead-time`, `backlog`, `threads`, `done`, `thread{id}`, `thread-state-{id}`, `thread-title-{id}`, `thread-user-story-{id}`, `user-story-{id}`, `user-story-{id}-{threadId}`, `story-name`, `priority-{id}`, `team-type`, `progress`, `stats`, `loader`, `back-button`, `backlog-empty`, `done-empty`, `backlog-count`, `done-count`, `threads-count`.
- **Simulation outputs**: `data.structureEvents` (`CreateUserStory`, `CreateThread`, `ThreadOff`, `ThreadIn`, `ChangePriority`) + `data.timeEvents` (`Todo`, `InProgress`, `Review`, `ToReview`, `Done` per thread/userStory pair).
- **Multi-reviewer source**: in `simulation-time.ts`, when a story has `state === 'Review'`, every effective active thread that satisfies `needReviewBy` calls `setReview` and pushes a `Review` `TimeEvent`. With `ParallelTeam` of N>2 threads and `reviewersNeeded ≥ 2`, several `Review` events fire on the same `userStoryId` in the same tick, one per thread. `EnsembleTeam` collapses to a single `mob` thread (id 0) so its visible event stream never produces simultaneous threads on the same review.

### Issue 1 — Missing story identifier

**Observation**: `UserStoryVue` already carries `id` (the domain identifier). The template never displays it. Users see two stories named `bug-3` and `bug-5` with no way to tell which is which when names collide, and no way to correlate UI to logs/console.

**Root cause**: pure render gap, `<span data-testid="story-name">{{ story.name }}</span>` shows the name only.

**Fix shape**: prefix the name with `#{id}` (e.g. `#7 my-story`) inside `story-name`, or add a sibling chip showing the id with `data-testid="story-id-{id}"`. The sibling chip is the safer choice because:
- Existing tests use `wrapper.get('[data-testid=story-name]').text()` and assert the exact name (lines 361, 366, 765 of `play.test.ts`). Modifying `story-name` text breaks them.
- A separate chip preserves the existing assertions and adds a clean accessible label.

### Issue 2 — Story duplication in multi-developer review

**Observation (reported)**: when several developers review the same user story (case typically reached with `ParallelTeam` of N≥3 threads), the story appears multiple times in `thread.reviewStories` and the duplicate count grows each tick.

**Source analysis**:

1. `handleReview` is enqueued via `mutations.push(handleReview(event))`; the guard `thread?.reviewStories.some(s => s.id === event.userStoryId)` runs at `processEvents` time, **before** the mutation executes.
2. `partitionParallel` splits events that conflict on `userStoryId`, so the three `Review(thread:1)`, `Review(thread:2)`, `Review(thread:3)` events for the same story land in three **separate batches**.
3. Inside one batch, the guard reads the current state, decides "not yet present", pushes `handleReview`. `animateBatch` then runs the mutation, which calls `findStoryById(userStoryId)`. The lookup order is: backlog → every thread's `inProgressStories` → every thread's `reviewStories`. The story is removed from backlog if found there, otherwise it stays in place and the **same reference** is pushed into `thread.reviewStories`.
4. So at tick T+1, when each thread receives `Review(thread:N)` again, the guard reads `thread.reviewStories.some(s.id === userStoryId)`. If the story is correctly stored, the guard returns true and the handler is skipped.
5. **Root cause of duplication**: the guard relies on `s.id === event.userStoryId`. When `handleReview` pushes the **same object reference** into multiple `thread.reviewStories` arrays (multi-reviewer flow), that reference is shared. Now if `handleInProgress` later runs on a thread that still holds the story in `reviewStories`, line 200 (`thread.reviewStories.splice(0)`) empties that thread's `reviewStories` array but **leaves** the same object referenced from the other threads. A subsequent `Review(thread:that-cleared-thread, us)` will pass the guard (its `reviewStories` is empty) and push the same shared reference **a second time** into another thread that already holds it via the shared reference — but the guard checks `s.id === userStoryId`, so this should still trigger the skip. Re-reading the code carefully, the duplication can only happen if **`findStoryById` returns a different object instance than the one already present** in `thread.reviewStories`. Since `findStoryById` walks all arrays and returns the first match, there is exactly one canonical object per `id` in the live state — so identity is preserved.

After exhaustive code reading and an exploratory integration test (5 threads, 2 user stories, complex review with `reviewComplexity = 6`, `reviewersNeeded = 4`, step-by-step replay), no duplication was reproduced on synthetic well-formed simulation outputs.

**Conclusion on the bug**: the duplication is **not provable from the current code path with well-formed simulator events**, but the report from the user is concrete. The most likely failure modes are:

- **A**: `findStoryById` finds the story inside `thread.inProgressStories` of the current thread (because a previous `Review` mutation has not yet run on that thread when the guard was evaluated in another batch). `handleReview` then does `thread.inProgressStories.splice(0)` **first**, **losing the reference**, then `findStoryById` scans the now-empty inProgress, may find the story in **another thread's reviewStories**, and push it again. Result: the story now lives in two threads' reviewStories — first one is the legitimate, second is the duplicate. On the next tick the same scenario repeats.
- **B**: `handleReview` calls `findStoryById` which iterates and returns the first hit. If the story is in `backlog`, splice it; but if it is found in another thread's `reviewStories`, it is **not removed** from that location — pushing it into the current thread creates the multi-reviewer state intentionally (this is required by the test "Should move userStories to the corresponding threads when reviewed by several threads"). The bug surface is: the guard catches only the current thread, never "is this story already in another thread's review array that we are about to push into?". In a degenerate event stream (e.g. a custom replay or non-deterministic ordering), the guard can be bypassed.

**Fix shape** (defensive, no behaviour regression):

1. Replace the guard at `processEvents` `case 'Review'` with a guard **inside** `handleReview` itself, evaluated at mutation time, so partition/scheduling cannot bypass it.
2. Compute the guard against `thread.reviewStories.some(s => s.id === event.userStoryId)` AND against `thread.inProgressStories.some(s => s.id === event.userStoryId)`. If the story is already in this thread (in any column), do not push again.
3. Add a regression test that runs a synthetic multi-reviewer simulation step-by-step and asserts: after each tick, each `(threadId, userStoryId)` pair appears **at most once** in the DOM (`wrapper.findAll('[data-testid="user-story-{us}-{thread}"]').length ≤ 1`).

This converts the suspect into a tested invariant. If the user reproduces the duplication after the fix, the new test will fail with the precise inputs and pin the actual scenario.

### Issue 3 — Remaining UX/UI gaps

Walking the component once `play-ux-design.md` is fully landed:

- **3.1 Tooltip on thread state chip** — `Wait`/`Develop`/`Review` is jargon. Adding a `title` attribute with a longer explanation helps non-domain users.
- **3.2 Visual distinction between "off" and "Wait"** — both currently render the chip text and a faded thread; "off" reduces opacity but the chip still reads `Wait`. Render the chip text as `Off` (or replace with an `Off` chip) when `thread.presence === 'off'` so the state column is unambiguous.
- **3.3 Backlog priority sort indicator** — backlog stories render in event-arrival order, not in priority order. The flag chip already shows the value but adjacent cards with priorities 5 / 1 / 3 look unordered. Sort `backlogStories` by priority descending (highest first), null priorities last. Stable across re-renders.
- **3.4 Done order = chronological** — done stories currently push in finish order. That is fine, but the lack of any timestamp / index makes it hard to tell `which was done first`. Add a small monotonic counter chip (`#1`, `#2`, …) in done order, distinct from the story id.
- **3.5 Toolbar overflow on narrow viewports** — the top `<nav>` packs progress bar + stats + team-type chip + spinner + two buttons. On a narrow screen they wrap awkwardly. Use BeerCSS responsive utilities (`hide-on-small` for the verbose `— Lead Time :` label, replace by `aria-label` on the value) and keep the buttons always visible.
- **3.6 Compute buttons icon-only on small screens** — same idea: hide the button labels under `s` breakpoint (BeerCSS class `hide-on-small`), keep the icon.
- **3.7 Focus styling missing** — the back-button and compute buttons inherit BeerCSS defaults but the priority/team-type chips have no visible focus ring. They are non-interactive (no `tabindex`, no click handler) so this is fine — explicitly add `aria-hidden="false"` is not needed. Skipped.
- **3.8 Story id and priority chip ordering** — when both are visible, decide layout: id chip on the left (matches a "label"), priority chip on the right (matches the existing flag chip). Codified in Issue 1's task.

**Strategy**:

- No new components, no architectural refactor.
- BeerCSS first; fallback to scoped CSS only when no utility matches.
- Tests in English, UI strings in English, caveman style only for `.claude/agents/*.md` (none touched in this plan).
- Preserve every existing data-testid; add new testids (`story-id-{id}`, `done-order-{id}`) without breaking lookups.

### Root causes summary

| # | Issue | Root cause |
|---|-------|------------|
| 1 | Missing identifier | Pure render omission. `id` is in state but template never renders it. |
| 2 | Multi-reviewer duplication | Guard against duplication lives at scheduling time (`processEvents`), not at mutation time. `handleReview` does not re-check the invariant before pushing into `thread.reviewStories`. Combined with the multi-reviewer flow (intentional) where the same object reference is shared across threads, certain event orderings can bypass the guard. |
| 3 | UX gaps | Several small omissions revealed once the previous pass landed; no single architectural cause. |

## Tasks

Order: **bugs first (Issue 2, then Issue 1), then UX (Issue 3)**. Each task is atomic (code + tests). After each task, run the verification block.

---

### Task 1 — Regression test that catches multi-reviewer duplication

**Goal**: lock the invariant before changing code.

**Files**:
- `src/front/play/play.test.ts`

**Code**:
- Add a `describe('Multi-reviewer duplication')` block with one test.
- Build a time-event stream that pushes the same `Review(userStoryId: 0)` event for three distinct threads at `time: 1`, then again at `time: 2` and `time: 3`:
  ```ts
  timeEvents: [
    reviewEvent({ time: 1, threadId: 0, userStoryId: 0 }),
    reviewEvent({ time: 1, threadId: 1, userStoryId: 0 }),
    reviewEvent({ time: 1, threadId: 2, userStoryId: 0 }),
    reviewEvent({ time: 2, threadId: 0, userStoryId: 0 }),
    reviewEvent({ time: 2, threadId: 1, userStoryId: 0 }),
    reviewEvent({ time: 2, threadId: 2, userStoryId: 0 }),
    reviewEvent({ time: 3, threadId: 0, userStoryId: 0 }),
    reviewEvent({ time: 3, threadId: 1, userStoryId: 0 }),
    reviewEvent({ time: 3, threadId: 2, userStoryId: 0 }),
  ],
  structureEvents: [createThread0(), createThread1(), createThread({id:2, name:'dev2'}), createUserStory({ id: 0 })],
  ```
- After clicking `compute-all` and `runAllTimersAsync`:
  - For each thread 0..2, assert `wrapper.findAll('[data-testid=user-story-0-{N}]').length === 1`.
  - Assert `wrapper.find('[data-testid=user-story-0]').exists() === false` (the story is in reviews, not backlog/done).

**Notes**:
- `createThread1` already exists in the file; add a local `createThread2` factory similar to it (`id: 2, name: 'dev2', action: 'CreateThread', time: 1`).
- This test passes on the current code (the existing guard handles this case). It documents the invariant explicitly and protects against future regressions in Task 2.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

### Task 2 — Move the duplication guard into `handleReview`

**Goal**: defensive fix so the invariant is enforced at the moment the mutation runs, not when it is scheduled.

**Files**:
- `src/front/play/play.vue`

**Code**:
- Remove the guard at `processEvents` `case 'Review':` (lines 300–305 of `play.vue`). Replace with the simple form:
  ```ts
  case 'Review':
    mutations.push(handleReview(event));
    break;
  ```
- Inside `handleReview`, add a guard at the very top of the inner function:
  ```ts
  const handleReview =
    (event: TimeEvent): (() => void) =>
    () => {
      const thread = threads.find((t) => t.id === event.threadId);
      if (!thread) return;
      if (thread.reviewStories.some((s) => s.id === event.userStoryId)) return;
      if (thread.inProgressStories.some((s) => s.id === event.userStoryId)) return;

      thread.inProgressStories.splice(0);
      // …rest unchanged
    };
  ```
- The two guard lines: (a) if already in this thread's review column, skip; (b) if currently in this thread's in-progress column, skip — covers the rare interleaving where an InProgress mutation has just placed the story.

**Tests**:
- Existing tests must still pass (no observable behaviour change for the happy path).
- The regression test from Task 1 must continue to pass.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

### Task 3 — Show story id chip on every story card

**Goal**: visual identifier visible on backlog, in-progress, review, done.

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- In each of the four story-card occurrences (backlog, thread in-progress, thread review, done), insert an id chip **before** the `story-name` span:
  ```html
  <span class="chip tiny" :data-testid="`story-id-${story.id}`" :aria-label="`Story ${story.id}`">
    #{{ story.id }}
  </span>
  <span class="max" data-testid="story-name">{{ story.name }}</span>
  ```
- Use BeerCSS `chip tiny` class; fallback `chip small` if `tiny` is not supported in the project's BeerCSS version (verify via WebFetch `https://www.beercss.com` if uncertain).
- The id chip stays on a single line; on narrow viewports the `max` class on the name lets it shrink first.

**Tests**:
- `story-id-0` chip is rendered for backlog story id 0 with text containing `#0`.
- `story-id-0` chip on `[data-testid=user-story-0-0]` in a thread when the story is in progress.
- `story-id-0` chip in done when the story is completed.
- `aria-label="Story 0"` present on the chip.
- Existing `story-name` text assertions (`US0`, `US1`) still pass (no concatenation into `story-name`).

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

### Task 4 — Show "Off" instead of "Wait" on a thread that is off

**Goal**: disambiguate the thread state chip when the thread is unavailable.

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Add a computed helper:
  ```ts
  const threadStateLabel = (thread: ThreadVue): string =>
    thread.presence === 'off' ? 'Off' : thread.state;
  ```
- Replace `{{ thread.state }}` in the `thread-state-{id}` chip with `{{ threadStateLabel(thread) }}`.
- Existing tests assert `Wait` / `Develop` / `Review` — none of them set `ThreadOff`, so they keep passing. Tests that set `ThreadOff` (e.g. lines 105–118) currently do not assert chip text; they assert class `off`. Both still hold.

**Tests**:
- New test: with `setThreadOff({id: 0, time: 1})`, `wrapper.get('[data-testid=thread-state-0]').text() === 'Off'`.
- New test: a thread with no off event still reads `Wait`.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

### Task 5 — Sort backlog by priority descending (null last)

**Goal**: visually highlight the next story the team will pick.

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Add a computed:
  ```ts
  const sortedBacklog = computed(() =>
    [...backlogStories].sort((a, b) => {
      if (a.priority === null && b.priority === null) return 0;
      if (a.priority === null) return 1;
      if (b.priority === null) return -1;
      return b.priority - a.priority;
    }),
  );
  ```
- Replace `v-for="story in backlogStories"` in the backlog column with `v-for="story in sortedBacklog"`.
- Other consumers of `backlogStories` (length checks, find/indexOf) remain on the raw `backlogStories` reactive array — sorting only affects the rendered list. The reactive priority pulse keeps working because the `flashingStoryIds` lookup is by id, not by index.

**Tests**:
- Two stories with priorities 1 and 5: the rendered DOM order has `user-story-{id-of-priority-5}` before `user-story-{id-of-priority-1}`.
- A story without priority (`null`) renders after stories with a priority.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

### Task 6 — Done sequence chip

**Goal**: show the order in which stories were completed.

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- The done column already iterates `doneStories` in push order (chronological). Add a sequence chip rendered alongside the id chip:
  ```html
  <span class="chip tiny" :data-testid="`done-order-${story.id}`">
    #{{ doneStories.indexOf(story) + 1 }}
  </span>
  ```
- Position: inside the done story card, before `story-name`. (If Task 3 added the id chip, the layout becomes `#3 (done order) | #7 (story id) | name | priority`. Acceptable; alternative: combine into a tooltip — kept as a single chip for clarity.)
- Tip: render only inside the done column (not in backlog / thread cards).

**Tests**:
- After completing two stories sequentially, the first done card has `done-order-{firstId}` text `#1`, the second has `done-order-{secondId}` text `#2`.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

### Task 7 — Hide verbose labels on narrow screens

**Goal**: keep the toolbar usable below the `s` breakpoint.

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Move the inline label `— Lead Time :` into a wrapping span with BeerCSS `hide-on-small` class.
- Move the compute button labels `Play next` and `Play All` into a span with `hide-on-small`. The aria-label already carries the long form for screen readers.
- The progress bar already has `min-width: 0`; no change.

**Tests**:
- `wrapper.find('[data-testid=compute]').get('span').classes()` contains `hide-on-small`.
- `wrapper.find('[data-testid=compute-all]').get('span').classes()` contains `hide-on-small`.
- `lead-time` span text unchanged; only its sibling label gets the class.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

### Task 8 — Tooltip on thread state chip

**Goal**: explain `Wait` / `Develop` / `Review` / `Off` to non-domain users.

**Files**:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

**Code**:
- Add a `title` attribute on the `thread-state-{id}` chip:
  ```ts
  const THREAD_STATE_TOOLTIP: Record<ThreadState | 'Off', string> = {
    Wait: 'Waiting for work',
    Develop: 'Developing a user story',
    Review: 'Reviewing a user story',
    Off: 'Thread is unavailable',
  };
  ```
- Template:
  ```html
  <span
    …
    :title="THREAD_STATE_TOOLTIP[threadStateLabel(thread) as keyof typeof THREAD_STATE_TOOLTIP]"
    >{{ threadStateLabel(thread) }}</span>
  ```

**Tests**:
- With a thread in default state, `thread-state-0` element has `title="Waiting for work"`.
- After an InProgress event, `title="Developing a user story"`.
- After a Review event, `title="Reviewing a user story"`.
- After ThreadOff, `title="Thread is unavailable"`.

**Verification**:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

## Recommended order

1. **Task 1** — write the multi-reviewer regression test first; it locks the current invariant.
2. **Task 2** — move the guard into `handleReview`; Task 1 + all existing tests must stay green.
3. **Task 3** — story id chip; smallest user-visible improvement, paves the way for Tasks 4–8.
4. **Task 4** — thread "Off" label.
5. **Task 5** — sort backlog by priority.
6. **Task 6** — done order chip.
7. **Task 7** — narrow-screen labels.
8. **Task 8** — state chip tooltip.

Tasks 3–8 are independent; their order is suggested by user-visible impact (information first, polish last) but they can be reordered if a BeerCSS class proves missing for one of them.

## Per-task verification

After each task:

```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

After the **last** task only:

```
npm run lint
npm run format
```

> Spinner / FLIP / GSAP behaviour from the previous plan is untouched; no animation tweak is required.
