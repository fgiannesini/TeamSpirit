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
  getComputeAll,
  getThreads,
} from '../../flow/selector.ts';
import type { TimeEvent } from '../../simulate/events.ts';
import type { StructureEvent } from '../../simulate/simulation-structure.ts';
import type { StatEvent } from '../../simulate/stats.ts';
import { useFormStore } from '../form-store.ts';

const props = defineProps<{ id: number }>();
const data = useFormStore().simulationOutputs[props.id];
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

const render = (
  events: TimeEvent[],
  statEvents: StatEvent[],
  structureEvents: StructureEvent[],
): void => {
  const threads = getThreads();
  if (threads) {
    addThreads(threads, structureEvents);
  }
  const backlog = getBacklog();
  if (backlog) {
    const initStructureEvents = structureEvents.filter(
      ({ time }) => time === 1,
    );
    addUserStories(backlog, initStructureEvents);
  }

  const maxTime = Math.max(...events.map((event) => event.time));
  let currentTime = 0;
  const computeButton = getCompute();
  computeButton?.addEventListener('click', async () => {
    computeButton.disabled = true;
    currentTime++;
    await renderTimeEvents(events, currentTime, 600);
    renderStatEvents(statEvents, currentTime, maxTime);
    buildUserStories(structureEvents, currentTime + 1);
    setThreadsOff(structureEvents, currentTime + 1);
    setThreadsIn(structureEvents, currentTime + 1);
    if (maxTime !== currentTime) {
      computeButton.disabled = false;
    }
  });

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
render(data.timeEvents, data.statEvents, data.structureEvents);
</script>

<template>
  <div class="meta">
  <div data-testid="stats" class="stats">
    <div>Time: <span data-testid="time"></span></div>
    <div>Lead Time: <span data-testid="lead-time"></span></div>
  </div>
  <button data-testid="compute">Play next</button>
  <button data-testid="compute-all">Play All</button>
  </div>

  <div data-testid="backlog-container" class="backlog"><span class="title">Backlog</span></div>
  <div data-testid="threads-container" class="threads"><span class="title">Threads</span></div>
  <div data-testid="done-container" class="done"><span class="title">Done</span></div>
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