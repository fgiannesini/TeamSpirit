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
        { x: dx, y: dy },
        { x: 0, y: 0, duration: durationMs / 1000, ease: 'power1.inOut' },
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

    thread.inProgressStories.splice(0);

    const story = findStoryById(event.userStoryId);
    if (story) {
      const backlogIdx = backlogStories.indexOf(story);
      if (backlogIdx !== -1) backlogStories.splice(backlogIdx, 1);
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

const threadStateClass = (state: ThreadState): string => {
  if (state === 'Develop') return 'thread--develop';
  if (state === 'Review') return 'thread--review';
  return '';
};

const THREAD_STATE_CHIP_COLOR: Record<ThreadState, string> = {
  Develop: 'primary',
  Review: 'secondary',
  Wait: '',
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
    <button
      class="transparent circle"
      data-testid="back-button"
      aria-label="Back to simulations"
      @click="router.push('/simulate')"
    >
      <i aria-hidden="true">arrow_back</i>
    </button>
    <progress :value="currentTime" :max="maxTime" data-testid="progress"></progress>
    <i aria-hidden="true">timer</i>
    <div data-testid="stats" class="row middle-align" aria-live="polite">
      <span data-testid="time" id="time">{{ timeDisplay }}</span>
      <span class="small-margin">— Lead Time :</span>
      <b
        ><span data-testid="lead-time" id="lead-time">{{ leadTimeDisplay }}</span></b
      >
    </div>
    <span class="chip" data-testid="team-type">
      <i aria-hidden="true">{{ teamTypeIcon }}</i>
      {{ teamType }}
    </span>
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
      @click="runNext()"
      :disabled="computeDisabled"
    >
      <i>play_arrow</i>
      <span>Play next</span>
    </button>
    <button
      id="compute-all"
      data-testid="compute-all"
      @click="runAll()"
      :disabled="computeAllDisabled"
    >
      <i>fast_forward</i>
      <span>Play All</span>
    </button>
  </nav>

  <div class="grid kanban">
    <div class="s12 m4">
      <article data-testid="backlog" id="backlog">
        <nav>
          <i>inbox</i>
          <h6 class="max">Backlog</h6>
          <span class="chip" data-testid="backlog-count"
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
            v-for="story in backlogStories"
            :key="story.id"
            :data-testid="'user-story-' + story.id"
            :data-flip-id="'story-' + story.id"
            class="story-card"
          >
            <span class="max" data-testid="story-name">{{ story.name }}</span>
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

    <div class="s12 m4">
      <article data-testid="threads" id="threads">
        <nav>
          <i>groups</i>
          <h6 class="max">Threads</h6>
          <span class="chip" data-testid="threads-count">{{ threads.length }} threads</span>
        </nav>
        <div
          v-for="thread in threads"
          :id="`thread${thread.id}`"
          :data-testid="`thread${thread.id}`"
          :class="['thread', thread.presence, threadStateClass(thread.state)]"
        >
          <div class="thread-header">
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
              >{{ thread.state }}</span
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
              class="story-card"
            >
              <span class="max" data-testid="story-name">{{ story.name }}</span>
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
              class="story-card story-card--review"
            >
              <span class="max" data-testid="story-name">{{ story.name }}</span>
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

    <div class="s12 m4">
      <article data-testid="done" id="done">
        <nav>
          <i>task_alt</i>
          <h6 class="max">Done</h6>
          <span class="chip" data-testid="done-count"
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
            class="story-card story-card--done"
          >
            <i class="small">check_circle</i>
            <span class="max" data-testid="story-name">{{ story.name }}</span>
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
nav > progress {
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
}

.column-stories {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.story-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--outline-variant);
  background: var(--surface-variant);

  &.story-card--review {
    border-color: var(--secondary);
    background: var(--secondary-container);
  }

  &.story-card--done {
    border-color: var(--primary);
    background: var(--primary-container);

    i {
      color: var(--primary);
    }
  }
}

.thread {
  border-radius: 0.75rem;
  border: 1px solid var(--outline-variant);
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  transition:
    border-color 0.3s,
    background-color 0.3s;

  &.thread--develop {
    border-color: var(--primary);
    background: var(--primary-container);
  }

  &.thread--review {
    border-color: var(--secondary);
    background: var(--secondary-container);
  }

  &.off {
    opacity: 0.5;
  }
}

.thread-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.thread-stories {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 1.5rem;
}
</style>
