<script setup lang="ts">
import { renderStatEvents } from '../../flow/render-stats.ts';
import {
  addThreads,
  setThreadsIn,
  setThreadsOff,
} from '../../flow/render-thread.ts';
import { renderTimeEvents } from '../../flow/render-time.ts';
import { addUserStories } from '../../flow/render-user-story.ts';
import {
  getBacklog,
  getCompute,
  getComputeAll, getThread,
  getThreads,
} from '../../flow/selector.ts';
import type { TimeEvent } from '../../simulate/events.ts';
import type { StructureEvent } from '../../simulate/simulation-structure.ts';
import type { StatEvent } from '../../simulate/stats.ts';
import { useFormStore } from '../form-store.ts';
import {ref} from "vue";

const props = defineProps<{ id: number }>();
const data = useFormStore().simulationOutputs[props.id];

const threads = data.structureEvents
    .filter(
        (event): event is Extract<StructureEvent, { action: 'CreateThread' }> =>
            event.action === 'CreateThread',
    )
    .map(({ id, name }) => ({
      id, name, state: 'Wait', presence: ''
    }));
const buildUserStories = (
  structureEvents: StructureEvent[],
  timeCount: number,
): void => {
  const backlog = getBacklog();
  if (backlog) {
    const initStructureEvents = structureEvents.filter(
      ({ time }) => time === timeCount,
    );
    addUserStories(backlog, initStructureEvents);
  }
};

let currentTime = 0;
const maxTime = Math.max(...data.timeEvents.map((event) => event.time));

const render = (
  events: TimeEvent[],
  statEvents: StatEvent[],
  structureEvents: StructureEvent[],
): void => {
  const backlog = getBacklog();
  if (backlog) {
    const initStructureEvents = structureEvents.filter(
      ({ time }) => time === 1,
    );
    addUserStories(backlog, initStructureEvents);
  }

  const computeButtonAll = getComputeAll();
  computeButtonAll?.addEventListener('click', async () => {
    while (maxTime !== currentTime) {
      currentTime++;
      await renderTimeEvents(events, currentTime, 300);
      renderStatEvents(statEvents, currentTime, maxTime);
      buildUserStories(structureEvents, currentTime + 1);
      setThreadsOff(structureEvents, currentTime + 1);
      setThreadsIn(structureEvents, currentTime + 1);
    }
    computeButtonAll.disabled = true;
  });
};
const computeDisabled = ref(false)
const runNext = async () => {
  computeDisabled.value = true;
  currentTime++;
  await renderTimeEvents(data.timeEvents, currentTime, 600);
  renderStatEvents(data.statEvents, currentTime, maxTime);
  buildUserStories(data.structureEvents, currentTime + 1);
  data.structureEvents
      .filter(({ action, time }) => action === 'ThreadOff' && time === currentTime + 1)
      .forEach(({ id }) => {
        const thread = threads.find(thread=> thread.id === id);
        if (thread) {
          thread.presence= 'off';
        }
      });
  setThreadsOff(data.structureEvents, currentTime + 1);
  setThreadsIn(data.structureEvents, currentTime + 1);
  if (maxTime !== currentTime) {
    computeDisabled.value = false;
  }
}
render(data.timeEvents, data.statEvents, data.structureEvents);
</script>

<template>
  <div class="meta">
  <div data-testid="stats" class="stats">
    <div>Time: <span data-testid="time" id="time"></span></div>
    <div>Lead Time: <span data-testid="lead-time" id="lead-time"></span></div>
  </div>
  <button id="compute" data-testid="compute" @click="runNext()" :disabled="computeDisabled">Play next</button>
  <button id="compute-all" data-testid="compute-all">Play All</button>
  </div>

  <div data-testid="backlog" id="backlog" class="backlog"><span class="title">Backlog</span></div>
  <div data-testid="threads" id="threads" class="threads"><span class="title">Threads</span>
    <div v-for="thread in threads" :id="`thread${thread.id}`" :data-testid="`thread${thread.id}`" :class="'thread ' + thread.presence">
      <div :id="`thread-title-${thread.id}`" :data-testid="`thread-title-${thread.id}`">{{thread.name}}</div>
      <div :id="`thread-user-story-${thread.id}`" :data-testid="`thread-user-story-${thread.id}`"></div>
      <div :id="`thread-state-${thread.id}`" :data-testid="`thread-state-${thread.id}`">{{thread.state}}</div>
    </div>
  </div>
  <div data-testid="done" id="done" class="done"><span class="title">Done</span></div>
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
  opacity:50%;
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