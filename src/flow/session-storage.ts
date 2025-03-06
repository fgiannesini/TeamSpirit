import { TimeEvent } from '../simulate/events.ts';
import { StatEvent } from '../simulate/stats.ts';

export const loadTimeEvents = () =>
  JSON.parse(sessionStorage.getItem('computation') ?? '[]') as TimeEvent[];

export const saveTimeEvents = (timeEvents: TimeEvent[]) =>
  sessionStorage.setItem('computation', JSON.stringify(timeEvents));

export const loadStatEvents = () =>
  JSON.parse(sessionStorage.getItem('stats') ?? '[]') as StatEvent[];

export const saveStatEvents = (statEvents: StatEvent[]) =>
  sessionStorage.setItem('stats', JSON.stringify(statEvents));
