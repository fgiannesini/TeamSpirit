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

### Task 3 — Show story id chip on every story card ✓ DONE

Story id chip rendered in backlog, thread in-progress, thread review, done. Tests cover chip text + aria-label in each column. See `play.test.ts:895-989`.

---

## Decisions before tasks 4–8

Three questions raised before continuing. Conclusions drive task shape below.

### Decision 1 — drop the id chip, surface id via title tooltip

Question: `#0` chip redundant when name `US0` already unique?

Reason chip useful:
- Name slugs collide in real sims (two `bug-fix`)
- id stable across renames
- id correlates DOM to simulator logs

Reason chip noisy:
- 4 cards × 1 chip = visual repetition
- Most cases name + id say same thing

Verdict: keep id reachable, drop visual chip. Move id into `title` attribute on `story-name` span. One value visible (name), id surface via hover + screen reader. Less DOM, no test churn on `story-id-{id}` queries (drop those tests).

Action: refactor task = task 4. Remove `story-id-{id}` chip from all four cards. Add `:title="\`#${story.id}\`"` on `story-name` span. Drop the four tests that query `story-id-0` chip text + aria-label. Keep `story-name` text tests untouched. Add one test: `story-name` span has `title="#0"`.

### Decision 2 — no StoryCard.vue extraction

Question: extract 4× duplicated card markup into child component?

Cost: rewrite all tests that query inside cards (`story-name`, `priority-{id}`, future `done-order-{id}`). 91 tests use `shallowMount` → child stubs hide inner DOM. Migration to `mount` = test churn across many specs.

Benefit: ~40 lines saved. Tasks 4–8 add no more card duplication (only done card touched by task 7 below).

Verdict: skip extraction. Duplication acceptable, stable at 4 instances after this plan. Revisit only if a 5th card appears or card grows past ~20 lines.

### Decision 3 — aria/title tests: keep behaviour-visible, drop pure markup

Rule: test what user perceives.

| Test target | Verdict | Reason |
|---|---|---|
| State chip visible text (`Wait`/`Develop`/`Off`) | Keep | User reads text |
| State chip `title` tooltip (4 states) | Keep, minimal | Tooltip = accessibility contract, cheap to assert |
| `story-id-{id}` chip aria-label | Drop | Chip removed per Decision 1 |
| New `title="#0"` on story-name | One test only | Confirms id surface preserved |
| `hide-on-small` class on toolbar labels | One test per label | Confirms responsive contract |
| Existing priority `aria-label` | Keep as-is | Not in scope, already tested |

---

### Task 4 — Drop story-id chip, add id as title on story-name

Goal: keep id reachable, remove visual repetition.

Files:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

Code:
- Four cards (backlog, thread in-progress, thread review, done): delete the `<span class="chip small" :data-testid="story-id-{id}" :aria-label="Story {id}">#{{ story.id }}</span>` block.
- On the `story-name` span in all four cards, add `:title="\`#${story.id}\`"`:
  ```html
  <span class="max" data-testid="story-name" :title="`#${story.id}`">{{ story.name }}</span>
  ```

Tests:
- Drop the four tests in the `describe('Story id chip', …)` block that query `story-id-0` (the four columns + the chip aria-label assertion). Keep the `'Should not alter story-name text'` test.
- Add one new test in same describe: backlog story id 0 + name `US0` → `wrapper.get('[data-testid=story-name]').attributes('title')` equals `'#0'`.
- Rename the describe block to `Story id surface` (block keeps minimal coverage of id presence).
- All other tests untouched — `story-name` text assertions still match (`US0`, `US1`).

Verification:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

### Task 5 — Show "Off" instead of "Wait" on a thread that is off

Goal: disambiguate state chip when thread unavailable.

Files:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

Code:
- Add helper:
  ```ts
  const threadStateLabel = (thread: ThreadVue): string =>
    thread.presence === 'off' ? 'Off' : thread.state;
  ```
- Replace `{{ thread.state }}` inside `thread-state-{id}` chip with `{{ threadStateLabel(thread) }}`.
- Existing `Wait`/`Develop`/`Review` assertions hold — no test sets `ThreadOff` and asserts `Wait` text.

Tests:
- New test: `structureEvents: [createThread0(), setThreadOff({ id: 0, time: 1 })]` → `wrapper.get('[data-testid=thread-state-0]').text() === 'Off'`.
- New test: thread with no off event → `text() === 'Wait'`.

Verification:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

### Task 6 — Sort backlog by priority descending (null last)

Goal: surface next story team will pick.

Files:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

Code:
- Add computed:
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
- Backlog column template: replace `v-for="story in backlogStories"` with `v-for="story in sortedBacklog"`.
- All other reads of `backlogStories` (length, indexOf, mutations) stay on the raw reactive array. `flashingStoryIds` looks up by id, sort does not break the pulse.

Tests:
- Two backlog stories with priorities 1 and 5: in DOM, `user-story-{id-of-5}` appears before `user-story-{id-of-1}` (assert via `wrapper.findAll('[data-testid^=user-story-]')` order or via direct sibling `nextElementSibling`).
- One story with priority + one with null priority → priority story renders first.

Verification:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

### Task 7 — Done sequence chip

Goal: show completion order.

Files:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

Code:
- Done card only — insert chip before `story-name`:
  ```html
  <span class="chip small" :data-testid="`done-order-${story.id}`">
    #{{ doneStories.indexOf(story) + 1 }}
  </span>
  ```
- Position: between `check_circle` icon and `story-name`.
- Backlog/thread cards unchanged — chip lives only in done column.

Tests:
- Complete two stories in sequence (two `doneEvent` calls): first done card `done-order-{firstId}` text equals `#1`, second card `done-order-{secondId}` text equals `#2`.

Verification:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

### Task 8 — Hide verbose labels on narrow screens

Goal: keep toolbar usable below `s` breakpoint.

Files:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

Code:
- Wrap `— Lead Time :` in a span with class `hide-on-small`.
- Wrap `Play next` and `Play All` button labels in spans with class `hide-on-small`. Long form lives in existing `aria-label`.
- Progress bar already has `min-width: 0` — no change.

Tests:
- `wrapper.get('[data-testid=compute]')` contains a span with class `hide-on-small` and text `Play next`.
- `wrapper.get('[data-testid=compute-all]')` contains a span with class `hide-on-small` and text `Play All`.
- `lead-time` value unchanged: existing `lead-time` text test still passes.

Verification:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

### Task 9 — Tooltip on thread state chip

Goal: explain `Wait`/`Develop`/`Review`/`Off` to non-domain users.

Files:
- `src/front/play/play.vue`
- `src/front/play/play.test.ts`

Code:
- Add map:
  ```ts
  const THREAD_STATE_TOOLTIP: Record<ThreadState | 'Off', string> = {
    Wait: 'Waiting for work',
    Develop: 'Developing a user story',
    Review: 'Reviewing a user story',
    Off: 'Thread is unavailable',
  };
  ```
- Template chip:
  ```html
  <span
    …
    :title="THREAD_STATE_TOOLTIP[threadStateLabel(thread) as keyof typeof THREAD_STATE_TOOLTIP]"
    >{{ threadStateLabel(thread) }}</span>
  ```
- Depends on task 5 (uses `threadStateLabel`).

Tests (4 — one per state, minimal):
- Default thread → `title="Waiting for work"`.
- After `inProgressEvent` → `title="Developing a user story"`.
- After `reviewEvent` → `title="Reviewing a user story"`.
- After `setThreadOff` → `title="Thread is unavailable"`.

Verification:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

---

## Recommended order

Tasks 1–3 done. Remaining tasks order driven by dependency + user impact.

1. **Task 4** — id chip cleanup. First because: removes dead surface before adding more, simplifies later cards.
2. **Task 5** — `Off` state label. Independent. Prereq for task 9 (`threadStateLabel` helper).
3. **Task 6** — backlog sort by priority. Independent, high user value.
4. **Task 7** — done-order chip. Independent.
5. **Task 8** — narrow-screen labels. Independent, polish.
6. **Task 9** — state chip tooltip. Must follow task 5 (reuses `threadStateLabel`).

Tasks 4, 6, 7, 8 fully independent — reorder freely if BeerCSS gap appears. Task 9 strictly after task 5.

## Per-task verification

After each task:
```
npm run type-check
npx vitest run src/front/play/play.test.ts
```

After last task only:
```
npm run lint
npm run format
```

> Spinner / FLIP / GSAP behaviour untouched; no animation tweak required.
