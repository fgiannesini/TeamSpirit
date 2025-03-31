import type { TimeEvent } from '../../simulate/events.ts';
import type { StatEvent } from '../../simulate/stats.ts';

export const loadTimeEvents = (key: string) =>
  JSON.parse(
    sessionStorage.getItem(`computation-${key}`) ?? '[]',
  ) as TimeEvent[];

export const saveTimeEvents = (timeEvents: TimeEvent[], key: string) =>
  sessionStorage.setItem(`computation-${key}`, JSON.stringify(timeEvents));

export const loadStatEvents = (key: string) =>
  JSON.parse(sessionStorage.getItem(`stats-${key}`) ?? '[]') as StatEvent[];

export const saveStatEvents = (statEvents: StatEvent[], key: string) =>
  sessionStorage.setItem(`stats-${key}`, JSON.stringify(statEvents));
