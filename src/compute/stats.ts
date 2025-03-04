import { TimeEvent } from './events.ts';

export type StatEvent = {
  time: number;
  leadTime: number;
};

export const computeStatEvents = (timeEvents: TimeEvent[]): StatEvent[] => [
  {
    time: 0,
    leadTime: 1,
  },
];
