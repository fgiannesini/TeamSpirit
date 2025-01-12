import { TimeEvent } from '../compute/events.ts';

export const loadTimeEvents = () =>
  JSON.parse(sessionStorage.getItem('computation')!) as TimeEvent[];

export const saveTimeEvents = (timeEvents: TimeEvent[]) =>
  sessionStorage.setItem('computation', JSON.stringify(timeEvents));
