import './flow.scss';
import { renderTimeEvents } from './render-time.ts';
import { loadStatEvents, loadTimeEvents } from './storage/session-storage.ts';
import { TimeEvent } from '../simulate/events.ts';
import { StatEvent } from '../simulate/stats.ts';
import {
  getBacklog,
  getCompute,
  getComputeAll,
  getThreads,
} from './selector.ts';
import { addThreads } from './render-thread.ts';
import { addUserStories } from './render-user-story.ts';
import { renderStatEvents } from './render-stats.ts';

const render = (events: TimeEvent[], statEvents: StatEvent[]) => {
  const threads = getThreads();
  if (threads) addThreads(threads, events);
  const backlog = getBacklog();
  if (backlog) addUserStories(backlog, events);

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
  render(loadTimeEvents(id), loadStatEvents(id));
}
