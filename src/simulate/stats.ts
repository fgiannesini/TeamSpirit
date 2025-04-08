import type { TimeEvent } from './events.ts';
import { State } from './user-story.ts';

export interface StatEvent {
  time: number;
  leadTime: number;
}

const mean = (times: number[]) => {
  const somme = times.reduce((acc, val) => acc + val, 0);
  return somme / times.length;
};

export const computeStatEvents = (timeEvents: TimeEvent[]): StatEvent[] => {
  const timesOfRunningUserStoriesByName = new Map<number, number>();
  const dones: number[] = [];
  const statEvents: StatEvent[] = [];
  let time = 1;

  while (true) {
    const currentEvents = timeEvents.filter(
      (event: TimeEvent) => event.time === time,
    );
    if (currentEvents.length === 0) {
      break;
    }

    const uniqueInProgressUserStoryIds = new Set(
      currentEvents
        .filter((event) => event.state === State.InProgress)
        .map((event) => event.userStoryId),
    );

    for (const userStoryId of uniqueInProgressUserStoryIds) {
      if (!timesOfRunningUserStoriesByName.has(userStoryId)) {
        timesOfRunningUserStoriesByName.set(userStoryId, 0);
      }
    }

    timesOfRunningUserStoriesByName.forEach((value, key) => {
      timesOfRunningUserStoriesByName.set(key, value + 1);
    });

    const uniqueUserStoryIdsDone = new Set(
      currentEvents
        .filter((event) => event.state === State.Done)
        .map((event) => event.userStoryId),
    );
    for (const userStoryId of uniqueUserStoryIdsDone) {
      const doneTime = timesOfRunningUserStoriesByName.get(userStoryId);
      if (doneTime) {
        dones.push(doneTime);
      }
      timesOfRunningUserStoriesByName.delete(userStoryId);
    }
    const leadTime = mean(dones);
    statEvents.push({
      time,
      leadTime: leadTime,
    });
    time++;
  }

  return statEvents;
};
