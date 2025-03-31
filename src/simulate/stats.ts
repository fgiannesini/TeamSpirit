import type {TimeEvent} from './events.ts';
import {State} from './user-story.ts';

export interface StatEvent {
  time: number;
  leadTime: number;
}

const mean = (times: number[]) => {
  const somme = times.reduce((acc, val) => acc + val, 0);
  return somme / times.length;
};

export const computeStatEvents = (timeEvents: TimeEvent[]): StatEvent[] => {
  const timesOfRunningUserStoriesByName = new Map<string, number>();
  const dones: number[] = [];
  const statEvents = [];
  let time = 1;

  while (true) {
    const currentEvents = timeEvents.filter(
      (event: TimeEvent) => event.time == time,
    );
    if (currentEvents.length === 0) break;

    const uniqueInProgressUserStoryNames = new Set(
      currentEvents
        .filter((event) => event.state === State.IN_PROGRESS)
        .map((event) => event.userStoryName),
    );

    for (const userStoryName of uniqueInProgressUserStoryNames) {
      if (!timesOfRunningUserStoriesByName.has(userStoryName)) {
        timesOfRunningUserStoriesByName.set(userStoryName, 0);
      }
    }

    timesOfRunningUserStoriesByName.forEach((value, key) => {
      timesOfRunningUserStoriesByName.set(key, value + 1);
    });

    const uniqueUserStoryNamesDone = new Set(
      currentEvents
        .filter((event) => event.state === State.DONE)
        .map((event) => event.userStoryName),
    );
    for (const userStoryName of uniqueUserStoryNamesDone) {
      const doneTime = timesOfRunningUserStoriesByName.get(userStoryName);
      if (doneTime) dones.push(doneTime);
      timesOfRunningUserStoriesByName.delete(userStoryName);
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
