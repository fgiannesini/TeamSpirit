<script setup lang="ts">
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { nextTick, reactive, ref } from 'vue';
import type { TimeEvent } from '../../simulate/events.ts';
import type { StructureEvent } from '../../simulate/simulation-structure.ts';
import { useFormStore } from '../form-store.ts';

gsap.registerPlugin(Flip);

const props = defineProps<{ id: number }>();
const data = useFormStore().simulationOutputs[props.id];

export type ThreadState = 'Wait' | 'Develop' | 'Review';
export type ThreadVue = {
  id: number;
  name: string;
  state: ThreadState;
  presence: string;
  userStories: UserStoryVue[];
};

type UserStoryVue = {
  id: number;
  name: string;
  priority: number | null;
  testId: string;
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
      userStories: [],
    })),
);

const backlogStories = reactive<UserStoryVue[]>([]);
const doneStories = reactive<UserStoryVue[]>([]);

const leadTime = ref('');
const timeDisplay = ref('');

const maxTime = Math.max(...data.timeEvents.map((e) => e.time));
let currentTime = 0;

const computeDisabled = ref(false);
const computeAllDisabled = ref(false);

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const animateMove = async (mutate: () => void): Promise<void> => {
  const state = Flip.getState('[data-flip-id]');
  mutate();
  await nextTick();
  Flip.from(state, { duration: 0.4, ease: 'power1.inOut', absolute: true });
};

const findStoryById = (id: number): UserStoryVue | undefined => {
  const inBacklog = backlogStories.find((s) => s.id === id);
  if (inBacklog) return inBacklog;
  for (const thread of threads) {
    const inThread = thread.userStories.find((s) => s.id === id);
    if (inThread) return inThread;
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
    const idx = thread.userStories.indexOf(story);
    if (idx !== -1) {
      thread.userStories.splice(idx, 1);
      return;
    }
  }
};

const setThreadState = (threadId: number, state: ThreadState): void => {
  const thread = threads.find((t) => t.id === threadId);
  if (thread) thread.state = state;
};

const buildUserStories = (time: number): void => {
  for (const event of data.structureEvents.filter((e) => e.time === time)) {
    if (event.action === 'CreateUserStory' && event.id !== -1) {
      backlogStories.push({
        id: event.id,
        name: event.name,
        priority: null,
        testId: `user-story-${event.id}`,
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
    const idx = thread.userStories.findIndex((s) => s.id === event.userStoryId);
    if (idx !== -1) {
      const [story] = thread.userStories.splice(idx, 1);
      backlogStories.push(story);
      return;
    }
  }
};

const handleInProgress = async (event: TimeEvent): Promise<void> => {
  await animateMove(() => {
    const targetTestId = `user-story-${event.userStoryId}-${event.threadId}`;
    const thread = threads.find((t) => t.id === event.threadId);
    if (!thread) return;

    const toMove = thread.userStories.filter((s) => s.testId !== targetTestId);
    for (const story of toMove) {
      thread.userStories.splice(thread.userStories.indexOf(story), 1);
      backlogStories.push(story);
    }

    const story = findStoryById(event.userStoryId);
    if (story && story.testId !== targetTestId) {
      removeStoryFromItsLocation(story);
      story.testId = targetTestId;
      thread.userStories.push(story);
    }

    setThreadState(event.threadId, 'Develop');
  });
};

const handleReview = async (event: TimeEvent): Promise<void> => {
  await animateMove(() => {
    const thread = threads.find((t) => t.id === event.threadId);
    if (!thread) return;

    thread.userStories.splice(0);

    const original = findStoryById(event.userStoryId);
    if (original) {
      thread.userStories.push({
        ...original,
        testId: `user-story-${event.userStoryId}-${event.threadId}`,
      });
    }

    const backlogIdx = backlogStories.findIndex((s) => s.id === event.userStoryId);
    if (backlogIdx !== -1) backlogStories.splice(backlogIdx, 1);

    setThreadState(event.threadId, 'Review');
  });
};

const handleToReview = async (event: TimeEvent): Promise<void> => {
  await animateMove(() => {
    let firstMoved = false;
    for (const thread of threads) {
      const story = thread.userStories.find((s) => s.id === event.userStoryId);
      if (story) {
        thread.userStories.splice(thread.userStories.indexOf(story), 1);
        if (!firstMoved) {
          story.testId = `user-story-${event.userStoryId}`;
          backlogStories.push(story);
          firstMoved = true;
        }
      }
    }
  });
};

const handleDone = (event: TimeEvent): void => {
  let firstMoved = false;
  for (const thread of threads) {
    const story = thread.userStories.find((s) => s.id === event.userStoryId);
    if (story) {
      thread.userStories.splice(thread.userStories.indexOf(story), 1);
      if (!firstMoved) {
        story.testId = `user-story-${event.userStoryId}`;
        doneStories.push(story);
        firstMoved = true;
      }
    }
  }
};

const updateStats = (time: number): void => {
  const events = data.statEvents.filter((e) => e.time === time);
  if (events.length === 0) return;
  leadTime.value = events[0].leadTime?.toFixed(2) ?? String(Number.NaN);
  timeDisplay.value = `${events[0].time}/${maxTime}`;
};

const processEvents = async (time: number, animationTime: number): Promise<void> => {
  const currentEvents = data.timeEvents.filter((e) => e.time === time);
  for (const event of currentEvents) {
    let shouldSleep = true;

    if (event.userStoryId === -1) {
      const thread = threads.find((t) => t.id === event.threadId);
      if (thread) thread.userStories.splice(0);
      setThreadState(event.threadId, 'Wait');
    } else {
      switch (event.state) {
        case 'Todo':
          handleTodo(event);
          break;
        case 'InProgress':
          handleInProgress(event);
          break;
        case 'Review': {
          const thread = threads.find((t) => t.id === event.threadId);
          if (thread?.userStories.some((s) => s.id === event.userStoryId)) {
            shouldSleep = false;
            break;
          }
          handleReview(event);
          break;
        }
        case 'ToReview':
          handleToReview(event);
          break;
        case 'Done':
          handleDone(event);
          break;
        default:
          break;
      }
    }

    if (shouldSleep) {
      await sleep(animationTime);
    }
  }
};

const runNext = async (): Promise<void> => {
  computeDisabled.value = true;
  currentTime++;
  await processEvents(currentTime, 600);
  updateStats(currentTime);
  buildUserStories(currentTime + 1);
  updateThreadPresence(currentTime + 1);
  if (maxTime !== currentTime) {
    computeDisabled.value = false;
  }
};

const runAll = async (): Promise<void> => {
  while (maxTime !== currentTime) {
    currentTime++;
    await processEvents(currentTime, 300);
    updateStats(currentTime);
    buildUserStories(currentTime + 1);
    updateThreadPresence(currentTime + 1);
  }
  computeAllDisabled.value = true;
};

buildUserStories(1);
updateThreadPresence(1);
</script>

<template>
  <div class="meta">
    <div data-testid="stats" class="stats">
      <div>
        Time: <span data-testid="time" id="time">{{ timeDisplay }}</span>
      </div>
      <div>
        Lead Time: <span data-testid="lead-time" id="lead-time">{{ leadTime }}</span>
      </div>
    </div>
    <button id="compute" data-testid="compute" @click="runNext()" :disabled="computeDisabled">
      Play next
    </button>
    <button
      id="compute-all"
      data-testid="compute-all"
      @click="runAll()"
      :disabled="computeAllDisabled"
    >
      Play All
    </button>
  </div>

  <div data-testid="backlog" id="backlog" class="backlog">
    <span class="title">Backlog</span>
    <div
      v-for="story in backlogStories"
      :key="story.testId"
      :data-testid="story.testId"
      class="userStory"
    >
      <span class="name">{{ story.name }}</span>
      <span v-if="story.priority !== null" class="priority">({{ story.priority }})</span>
    </div>
  </div>
  <div data-testid="threads" id="threads" class="threads">
    <span class="title">Threads</span>
    <div
      v-for="thread in threads"
      :id="`thread${thread.id}`"
      :data-testid="`thread${thread.id}`"
      :class="['thread', thread.presence]"
    >
      <div :id="`thread-title-${thread.id}`" :data-testid="`thread-title-${thread.id}`">
        {{ thread.name }}
      </div>
      <div :id="`thread-user-story-${thread.id}`" :data-testid="`thread-user-story-${thread.id}`">
        <div
          v-for="story in thread.userStories"
          :key="story.testId"
          :data-testid="story.testId"
          class="userStory"
        >
          <span class="name">{{ story.name }}</span>
          <span v-if="story.priority !== null" class="priority">({{ story.priority }})</span>
        </div>
      </div>
      <div :id="`thread-state-${thread.id}`" :data-testid="`thread-state-${thread.id}`">
        {{ thread.state }}
      </div>
    </div>
  </div>
  <div data-testid="done" id="done" class="done">
    <span class="title">Done</span>
    <div
      v-for="story in doneStories"
      :key="story.testId"
      :data-testid="story.testId"
      class="userStory"
    >
      <span class="name">{{ story.name }}</span>
      <span v-if="story.priority !== null" class="priority">({{ story.priority }})</span>
    </div>
  </div>
</template>
<style scoped>
:root {
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
}

body {
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
  flex-direction: column;
  justify-content: space-around;
}

button {
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  cursor: pointer;

  &:hover {
    border-color: #646cff;
  }

  &:focus,
  &:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }
}

.backlog,
.done {
  width: 100%;
  height: 15vh;
  display: flex;
  align-items: first baseline;
  flex-wrap: wrap;
  border: aliceblue solid 1px;
}

.threads {
  width: 100%;
  height: 30vh;
  display: flex;
  align-items: first baseline;
  flex-wrap: wrap;
  border: aliceblue solid 1px;
}

.off {
  opacity: 50%;
}
.title {
  width: 100%;
  margin: 0.375rem;
}

.stats {
  width: 8rem;
  border: aliceblue solid 1px;
  padding: 0.375rem;
}

.userStory {
  align-content: center;
  text-align: center;
  padding: 0.375rem;
  min-width: 2rem;
  height: 2rem;
  border: aliceblue solid 1px;
  margin: 0.375rem;
  .priority {
    margin-left: 0.1rem;
  }
}

.thread {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
  padding: 0.375rem;
  min-width: 6rem;
  min-height: 6rem;
  border: aliceblue solid 1px;
  margin: 0.375rem;
}

.meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  & > * {
    margin: 0 1rem;
  }
}
</style>
