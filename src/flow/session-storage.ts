import { TimeEvent } from '../compute/events.ts';
import { StatEvent } from '../compute/stats.ts';

export const loadTimeEvents = () =>
  JSON.parse(sessionStorage.getItem('computation')!) as TimeEvent[];

export const saveTimeEvents = (timeEvents: TimeEvent[]) =>
  sessionStorage.setItem('computation', JSON.stringify(timeEvents));

export const saveStatEvents = (statEvents: StatEvent[]) =>
  sessionStorage.setItem('stats', JSON.stringify(statEvents));
