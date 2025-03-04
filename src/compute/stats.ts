import { TimeEvent } from './events.ts';

export interface StatEvent {
  time: number;
  leadTime: number;
}

const mean = (times: number[]) => {
  const somme = times.reduce((acc, val) => acc + val, 0);
  return somme / times.length;
};

export const computeStatEvents = (timeEvents: TimeEvent[]): StatEvent[] => {
  const timesByUserStoryName = new Map<string, number>();
  const statEvents = [];
  let time = 1;
  while (true) {
    const currentEvents = timeEvents.filter(
      (event: TimeEvent) => event.time == time
    );
    if (currentEvents.length === 0) break;

    const uniqueUserStoryNames = new Set(
      currentEvents.map((event) => event.userStoryName)
    );
    for (const userStoryName of uniqueUserStoryNames) {
      const currentTime = timesByUserStoryName.get(userStoryName) ?? 0;
      timesByUserStoryName.set(userStoryName, currentTime + 1);
    }
    const leadTime = mean(Array.from(timesByUserStoryName.values()));
    statEvents.push({
      time,
      leadTime: leadTime,
    });
    time++;
  }

  return statEvents;
};
