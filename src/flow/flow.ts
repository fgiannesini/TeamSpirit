import './flow.scss';
import type { TimeEvent } from '../simulate/events.ts';
import type { StructureEvent } from '../simulate/simulation-structure.ts';
import type { StatEvent } from '../simulate/stats.ts';
import { renderStatEvents } from './render-stats.ts';
import { addThreads } from './render-thread.ts';
import { renderTimeEvents } from './render-time.ts';
import { addUserStories } from './render-user-story.ts';
import {
  getBacklog,
  getCompute,
  getComputeAll,
  getThreads,
} from './selector.ts';
import {
  loadStatEvents,
  loadStructureEvents,
  loadTimeEvents,
} from './storage/session-storage.ts';

const render = (
  events: TimeEvent[],
  statEvents: StatEvent[],
  structureEvents: StructureEvent[],
) => {
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
  let time = 0;
  const computeButton = getCompute();
  computeButton?.addEventListener('click', async () => {
    computeButton.disabled = true;
    time++;
    await renderTimeEvents(events, time, 1000);
    renderStatEvents(statEvents, time, maxTime);
    if (maxTime !== time) {
      computeButton.disabled = false;
    }
  });

  const computeButtonAll = getComputeAll();
  computeButtonAll?.addEventListener('click', async () => {
    while (maxTime !== time) {
      time++;
      await renderTimeEvents(events, time, 300);
      renderStatEvents(statEvents, time, maxTime);
    }
    computeButtonAll.disabled = true;
  });
};

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
if (id) {
  render(loadTimeEvents(id), loadStatEvents(id), loadStructureEvents(id));
}
