<script setup lang="ts">
import { gsap } from 'gsap';
import { computed, nextTick, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { TimeEvent } from '../../simulate/events.ts';
import type { StructureEvent } from '../../simulate/simulation-structure.ts';
import { useFormStore } from '../form-store.ts';

const props = defineProps<{ id: number }>();
const data = useFormStore().simulationOutputs[props.id];
const router = useRouter();

export type ThreadState = 'Wait' | 'Develop' | 'Review';
export type ThreadVue = {
  id: number;
  name: string;
  state: ThreadState;
  presence: string;
  inProgressStories: UserStoryVue[];
  reviewStories: UserStoryVue[];
};

type UserStoryVue = {
  id: number;
  name: string;
  priority: number | null;
};

const threads = reactive<ThreadVue[]>(
  data.structureEvents
    .filter(
      (e): e is Extract<StructureEvent, { action: 'CreateThread' }> => e.action === 'CreateThread',
    )
    .map(({ id, name }) => ({
      id,
      name,
      state: 'Wait' as ThreadState,
      presence: '',
      inProgressStories: [],
      reviewStories: [],
    })),
);

const backlogStories = reactive<UserStoryVue[]>([]);
const doneStories = reactive<UserStoryVue[]>([]);
const flashingStoryIds = reactive(new Set<number>());

const sortedBacklog = computed(() =>
  [...backlogStories].sort((a, b) => {
    if (a.priority === null && b.priority === null) return 0;
    if (a.priority === null) return 1;
    if (b.priority === null) return -1;
    return b.priority - a.priority;
  }),
);

const leadTime = ref<number | null>(null);

const leadTimeDisplay = computed(() => {
  if (leadTime.value === null || Number.isNaN(leadTime.value)) return '—';
  return leadTime.value.toFixed(2);
});

const maxTime = data.timeEvents.length > 0 ? Math.max(...data.timeEvents.map((e) => e.time)) : 0;
const currentTime = ref(0);

const timeDisplay = computed(() =>
  currentTime.value === 0 ? '' : `${currentTime.value}/${maxTime}`,
);

const teamType = data.teamType;
const teamTypeIcon = teamType === 'Parallel' ? 'groups' : 'hub';

const computeDisabled = ref(false);
const computeAllDisabled = ref(false);
const isAnimating = ref(false);

const captureFlipPositions = (): Map<string, DOMRect> => {
  const positions = new Map<string, DOMRect>();
  document.querySelectorAll('[data-flip-id]').forEach((el) => {
    positions.set(el.getAttribute('data-flip-id')!, el.getBoundingClientRect());
  });
  return positions;
};

const animateFromPositions = (positions: Map<string, DOMRect>, durationMs: number): Promise<void> =>
  new Promise<void>((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });
    document.querySelectorAll('[data-flip-id]').forEach((el) => {
      const flipId = el.getAttribute('data-flip-id')!;
      const oldRect = positions.get(flipId);
      if (!oldRect) return;
      const newRect = el.getBoundingClientRect();
      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;
      if (dx === 0 && dy === 0) return;
      tl.fromTo(
        el,
        { x: dx, y: dy, zIndex: 100, position: 'relative' },
        {
          x: 0,
          y: 0,
          duration: durationMs / 1000,
          ease: 'power1.inOut',
          clearProps: 'zIndex,position',
        },
        0,
      );
    });
  });

const animateBatch = async (mutations: (() => void)[], durationMs: number): Promise<void> => {
  if (mutations.length === 0) return;
  const positions = captureFlipPositions();
  for (const mutate of mutations) mutate();
  await nextTick();
  await animateFromPositions(positions, durationMs);
};

const findStoryById = (id: number): UserStoryVue | undefined => {
  const inBacklog = backlogStories.find((s) => s.id === id);
  if (inBacklog) return inBacklog;
  for (const thread of threads) {
    const inThread = thread.inProgressStories.find((s) => s.id === id);
    if (inThread) return inThread;
    const inReview = thread.reviewStories.find((s) => s.id === id);
    if (inReview) return inReview;
  }
  return undefined;
};

const removeStoryFromItsLocation = (story: UserStoryVue): void => {
  const backlogIdx = backlogStories.indexOf(story);
  if (backlogIdx !== -1) {
    backlogStories.splice(backlogIdx, 1);
    return;
  }
  for (const thread of threads) {
    const idx = thread.inProgressStories.indexOf(story);
    if (idx !== -1) {
      thread.inProgressStories.splice(idx, 1);
      return;
    }
    const reviewIdx = thread.reviewStories.indexOf(story);
    if (reviewIdx !== -1) {
      thread.reviewStories.splice(reviewIdx, 1);
      return;
    }
  }
};

const setThreadState = (threadId: number, state: ThreadState): void => {
  const thread = threads.find((t) => t.id === threadId);
  if (thread) thread.state = state;
};

const handleIdleThread = (threadId: number): void => {
  const thread = threads.find((t) => t.id === threadId);
  if (thread) {
    thread.inProgressStories.splice(0);
    thread.reviewStories.splice(0);
  }
  setThreadState(threadId, 'Wait');
};

const buildUserStories = (time: number): void => {
  for (const event of data.structureEvents.filter((e) => e.time === time)) {
    if (event.action === 'CreateUserStory' && event.id !== -1) {
      backlogStories.push({
        id: event.id,
        name: event.name,
        priority: null,
      });
    }
    if (event.action === 'ChangePriority') {
      const story = findStoryById(event.id);
      if (story) story.priority = event.value;
      flashingStoryIds.add(event.id);
      setTimeout(() => flashingStoryIds.delete(event.id), 800);
    }
  }
};

const updateThreadPresence = (time: number): void => {
  for (const event of data.structureEvents.filter((e) => e.time === time)) {
    const thread = threads.find((t) => t.id === event.id);
    if (!thread) continue;
    if (event.action === 'ThreadOff') thread.presence = 'off';
    else if (event.action === 'ThreadIn') thread.presence = '';
  }
};

const handleTodo = (event: TimeEvent): void => {
  for (const thread of threads) {
    const idx = thread.inProgressStories.findIndex((s) => s.id === event.userStoryId);
    if (idx !== -1) {
      const [story] = thread.inProgressStories.splice(idx, 1);
      backlogStories.push(story);
      return;
    }
  }
};

const handleInProgress =
  (event: TimeEvent): (() => void) =>
  () => {
    const thread = threads.find((t) => t.id === event.threadId);
    if (!thread) return;

    const toMove = thread.inProgressStories.filter((s) => s.id !== event.userStoryId);
    for (const story of toMove) {
      thread.inProgressStories.splice(thread.inProgressStories.indexOf(story), 1);
      backlogStories.push(story);
    }
    thread.reviewStories.splice(0);

    const story = findStoryById(event.userStoryId);
    if (story && !thread.inProgressStories.some((s) => s.id === event.userStoryId)) {
      removeStoryFromItsLocation(story);
      thread.inProgressStories.push(story);
    }

    setThreadState(event.threadId, 'Develop');
  };

const handleReview =
  (event: TimeEvent): (() => void) =>
  () => {
    const thread = threads.find((t) => t.id === event.threadId);
    if (!thread) return;

    const story = findStoryById(event.userStoryId);
    if (!story) {
      setThreadState(event.threadId, 'Review');
      return;
    }

    const backlogIdx = backlogStories.indexOf(story);
    if (backlogIdx !== -1) backlogStories.splice(backlogIdx, 1);

    for (const t of threads) {
      const idx = t.inProgressStories.indexOf(story);
      if (idx !== -1) t.inProgressStories.splice(idx, 1);
    }

    if (!thread.reviewStories.some((s) => s.id === event.userStoryId)) {
      thread.reviewStories.push(story);
    }

    setThreadState(event.threadId, 'Review');
  };

const moveStoryFromThreadsTo = (storyId: number, destination: UserStoryVue[]): void => {
  let story: UserStoryVue | undefined;
  for (const thread of threads) {
    const userIdx = thread.inProgressStories.findIndex((s) => s.id === storyId);
    if (userIdx !== -1) {
      story = thread.inProgressStories.splice(userIdx, 1)[0];
    }
    const reviewIdx = thread.reviewStories.findIndex((s) => s.id === storyId);
    if (reviewIdx !== -1) {
      story = thread.reviewStories.splice(reviewIdx, 1)[0];
    }
  }
  if (story) destination.push(story);
};

const handleToReview =
  (event: TimeEvent): (() => void) =>
  () =>
    moveStoryFromThreadsTo(event.userStoryId, backlogStories);

const handleDone =
  (event: TimeEvent): (() => void) =>
  () =>
    moveStoryFromThreadsTo(event.userStoryId, doneStories);

const THREAD_STATE_CLASSES: Record<ThreadState, { state: string; container: string }> = {
  Develop: { state: 'thread--develop', container: 'primary-container' },
  Review: { state: 'thread--review', container: 'secondary-container' },
  Wait: { state: '', container: '' },
};

const THREAD_STATE_CHIP_COLOR: Record<ThreadState, string> = {
  Develop: 'primary',
  Review: 'secondary',
  Wait: '',
};

const threadStateLabel = (thread: ThreadVue): ThreadState | 'Off' =>
  thread.presence === 'off' ? 'Off' : thread.state;

const THREAD_STATE_TOOLTIP: Record<ThreadState | 'Off', string> = {
  Wait: 'Waiting for work',
  Develop: 'Developing a user story',
  Review: 'Reviewing a user story',
  Off: 'Thread is unavailable',
};

const updateStats = (time: number): void => {
  const events = data.statEvents.filter((e) => e.time === time);
  if (events.length === 0) return;
  leadTime.value = events[0].leadTime;
};

const conflicts = (a: TimeEvent, b: TimeEvent): boolean =>
  a.threadId === b.threadId || (a.userStoryId !== -1 && a.userStoryId === b.userStoryId);

const partitionParallel = (events: TimeEvent[]): TimeEvent[][] => {
  const batches: TimeEvent[][] = [];
  for (const event of events) {
    const target = batches.find((batch) => !batch.some((e) => conflicts(e, event)));
    if (target) target.push(event);
    else batches.push([event]);
  }
  return batches;
};

const processEvents = async (time: number, animationTime: number): Promise<void> => {
  const currentEvents = data.timeEvents.filter((e) => e.time === time);
  for (const batch of partitionParallel(currentEvents)) {
    const mutations: (() => void)[] = [];
    for (const event of batch) {
      if (event.userStoryId === -1) {
        handleIdleThread(event.threadId);
      } else {
        switch (event.state) {
          case 'Todo':
            handleTodo(event);
            break;
          case 'InProgress':
            mutations.push(handleInProgress(event));
            break;
          case 'Review': {
            const thread = threads.find((t) => t.id === event.threadId);
            if (thread?.reviewStories.some((s) => s.id === event.userStoryId)) break;
            mutations.push(handleReview(event));
            break;
          }
          case 'ToReview':
            mutations.push(handleToReview(event));
            break;
          case 'Done':
            mutations.push(handleDone(event));
            break;
          default:
            break;
        }
      }
    }
    await animateBatch(mutations, animationTime);
  }
};

const advanceStep = async (time: number, animationMs: number): Promise<void> => {
  await processEvents(time, animationMs);
  updateStats(time);
  buildUserStories(time + 1);
  updateThreadPresence(time + 1);
};

const runNext = async (): Promise<void> => {
  computeDisabled.value = true;
  isAnimating.value = true;
  currentTime.value++;
  await advanceStep(currentTime.value, 600);
  isAnimating.value = false;
  if (maxTime !== currentTime.value) {
    computeDisabled.value = false;
  }
};

const runAll = async (): Promise<void> => {
  isAnimating.value = true;
  while (maxTime !== currentTime.value) {
    currentTime.value++;
    await advanceStep(currentTime.value, 300);
  }
  isAnimating.value = false;
  computeAllDisabled.value = true;
};

buildUserStories(1);
updateThreadPresence(1);
</script>

<template>
  <nav class="top surface-container">
    <div class="row middle-align no-padding">
      <button
        class="transparent circle"
        data-testid="back-button"
        aria-label="Back to simulations"
        @click="router.push('/simulate')"
      >
        <i aria-hidden="true">arrow_back</i>
      </button>
    </div>
    <div class="row middle-align max no-padding">
      <i aria-hidden="true">timer</i>
      <progress :value="currentTime" :max="maxTime" data-testid="progress"></progress>
      <div
        data-testid="stats"
        class="row middle-align"
        aria-live="polite"
        aria-label="Simulation statistics"
      >
        <span data-testid="time" id="time">{{ timeDisplay }}</span>
        <span class="small-margin hide-on-small">— Lead Time :</span>
        <b
          ><span data-testid="lead-time" id="lead-time">{{ leadTimeDisplay }}</span></b
        >
      </div>
      <span class="chip" data-testid="team-type">
        <i aria-hidden="true">{{ teamTypeIcon }}</i>
        {{ teamType }}
      </span>
    </div>
    <div class="row middle-align no-padding">
      <span
        class="loader-spinner"
        :class="{ 'loader-hidden': !isAnimating }"
        data-testid="loader"
        aria-hidden="true"
      ></span>
      <button
        id="compute"
        data-testid="compute"
        class="border"
        aria-label="Advance one step"
        @click="runNext()"
        :disabled="computeDisabled"
      >
        <i aria-hidden="true">play_arrow</i>
        <span class="hide-on-small">Play next</span>
      </button>
      <button
        id="compute-all"
        data-testid="compute-all"
        aria-label="Run full simulation"
        @click="runAll()"
        :disabled="computeAllDisabled"
      >
        <i aria-hidden="true">fast_forward</i>
        <span class="hide-on-small">Play All</span>
      </button>
    </div>
  </nav>

  <div class="grid kanban">
    <div class="s12 m3">
      <article data-testid="backlog" id="backlog">
        <nav class="surface-container-high small-padding">
          <i aria-hidden="true">inbox</i>
          <h6 class="max">Backlog</h6>
          <span class="column-count" data-testid="backlog-count" aria-label="Backlog story count"
            >{{ backlogStories.length }} {{ backlogStories.length > 1 ? 'stories' : 'story' }}</span
          >
        </nav>
        <div
          v-if="backlogStories.length === 0"
          data-testid="backlog-empty"
          class="center-align padding"
        >
          <i class="extra" aria-hidden="true">inbox</i>
          <p>Backlog is empty</p>
        </div>
        <div v-else class="column-stories">
          <div
            v-for="story in sortedBacklog"
            :key="story.id"
            :data-testid="'user-story-' + story.id"
            :data-flip-id="'story-' + story.id"
            :class="[
              'story-card',
              'row',
              'middle-align',
              'small-padding',
              'round',
              'border',
              'surface-variant',
              { 'priority-flash': flashingStoryIds.has(story.id) },
            ]"
          >
            <span class="max" data-testid="story-name" :title="`#${story.id}`">{{
              story.name
            }}</span>
            <span
              v-if="story.priority !== null"
              class="chip small"
              :data-testid="`priority-${story.id}`"
              :aria-label="`Priority ${story.priority}`"
            >
              <i aria-hidden="true">flag</i>
              <span>{{ story.priority }}</span>
            </span>
          </div>
        </div>
      </article>
    </div>

    <div class="s12 m6">
      <article data-testid="threads" id="threads">
        <nav class="surface-container-high small-padding">
          <i aria-hidden="true">groups</i>
          <h6 class="max">Threads</h6>
          <span class="column-count" data-testid="threads-count" aria-label="Threads count"
            >{{ threads.length }} threads</span
          >
        </nav>
        <div
          v-for="thread in threads"
          :id="`thread${thread.id}`"
          :data-testid="`thread${thread.id}`"
          :class="[
            'thread',
            'border',
            'round',
            'small-padding',
            thread.presence,
            THREAD_STATE_CLASSES[thread.state].state,
            THREAD_STATE_CLASSES[thread.state].container,
          ]"
        >
          <div class="row middle-align">
            <span
              :id="`thread-title-${thread.id}`"
              :data-testid="`thread-title-${thread.id}`"
              class="max"
            >
              {{ thread.name }}
            </span>
            <span
              :id="`thread-state-${thread.id}`"
              :data-testid="`thread-state-${thread.id}`"
              :class="['chip', 'small', THREAD_STATE_CHIP_COLOR[thread.state]]"
              :title="THREAD_STATE_TOOLTIP[threadStateLabel(thread)]"
              >{{ threadStateLabel(thread) }}</span
            >
          </div>
          <div
            :id="`thread-user-story-${thread.id}`"
            :data-testid="`thread-user-story-${thread.id}`"
            class="thread-stories"
          >
            <div
              v-for="story in thread.inProgressStories"
              :key="story.id"
              :data-testid="'user-story-' + story.id + '-' + thread.id"
              :data-flip-id="'story-' + story.id"
              :class="[
                'story-card',
                'row',
                'middle-align',
                'small-padding',
                'round',
                'border',
                'surface-variant',
                { 'priority-flash': flashingStoryIds.has(story.id) },
              ]"
            >
              <span class="max" data-testid="story-name" :title="`#${story.id}`">{{
                story.name
              }}</span>
              <span
                v-if="story.priority !== null"
                class="chip small"
                :data-testid="`priority-${story.id}`"
                :aria-label="`Priority ${story.priority}`"
              >
                <i aria-hidden="true">flag</i>
                <span>{{ story.priority }}</span>
              </span>
            </div>
            <div
              v-for="story in thread.reviewStories"
              :key="'review-' + story.id"
              :data-testid="'user-story-' + story.id + '-' + thread.id"
              :data-flip-id="'story-' + story.id"
              :class="[
                'story-card',
                'row',
                'middle-align',
                'small-padding',
                'round',
                'border',
                'surface-variant',
                'story-card--review',
                { 'priority-flash': flashingStoryIds.has(story.id) },
              ]"
            >
              <span class="max" data-testid="story-name" :title="`#${story.id}`">{{
                story.name
              }}</span>
              <span
                v-if="story.priority !== null"
                class="chip small"
                :data-testid="`priority-${story.id}`"
                :aria-label="`Priority ${story.priority}`"
              >
                <i aria-hidden="true">flag</i>
                <span>{{ story.priority }}</span>
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div class="s12 m3">
      <article data-testid="done" id="done">
        <nav class="surface-container-high small-padding">
          <i aria-hidden="true">task_alt</i>
          <h6 class="max">Done</h6>
          <span class="column-count" data-testid="done-count" aria-label="Done story count"
            >{{ doneStories.length }} {{ doneStories.length > 1 ? 'stories' : 'story' }}</span
          >
        </nav>
        <div v-if="doneStories.length === 0" data-testid="done-empty" class="center-align padding">
          <i class="extra" aria-hidden="true">hourglass_empty</i>
          <p>No story completed yet</p>
        </div>
        <div v-else class="column-stories">
          <div
            v-for="story in doneStories"
            :key="story.id"
            :data-testid="'user-story-' + story.id"
            :data-flip-id="'story-' + story.id"
            :class="[
              'story-card',
              'row',
              'middle-align',
              'small-padding',
              'round',
              'border',
              'story-card--done',
              'primary-container',
              { 'priority-flash': flashingStoryIds.has(story.id) },
            ]"
          >
            <i class="small" aria-hidden="true">check_circle</i>
            <span class="max" data-testid="story-name" :title="`#${story.id}`">{{
              story.name
            }}</span>
            <span
              v-if="story.priority !== null"
              class="chip small"
              :data-testid="`priority-${story.id}`"
              :aria-label="`Priority ${story.priority}`"
            >
              <i aria-hidden="true">flag</i>
              <span>{{ story.priority }}</span>
            </span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
nav progress {
  min-width: 0;
}

.loader-spinner {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--outline-variant);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: loader-spin 0.8s linear infinite;
  flex-shrink: 0;
}

.loader-hidden {
  opacity: 0;
  animation: none;
}

@keyframes loader-spin {
  to {
    transform: rotate(360deg);
  }
}

.kanban {
  padding: 0 1rem 1rem;
  align-items: stretch;

  article > nav {
    border-bottom: 1px solid var(--outline-variant);
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-radius: 0.5rem 0.5rem 0 0;
  }
}

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

.column-stories {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.story-card {
  position: relative;
  transition:
    border-color 0.3s,
    background-color 0.3s;

  &.story-card--review {
    border-color: var(--secondary);
  }

  &.story-card--done {
    border-color: var(--primary);

    i {
      color: var(--primary);
    }
  }
}

.thread {
  margin-bottom: 0.5rem;
  transition:
    border-color 0.3s,
    background-color 0.3s;

  &.thread--develop {
    border-color: var(--primary);
  }

  &.thread--review {
    border-color: var(--secondary);
  }

  &.off {
    opacity: 0.5;
  }
}

.thread-stories {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 1.5rem;
}

@keyframes priority-flash {
  0%,
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
  40% {
    box-shadow: 0 0 0 3px var(--primary);
  }
}

.priority-flash {
  animation: priority-flash 0.8s ease-in-out;
}
</style>
