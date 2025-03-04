import { TimeEvent } from './events.ts';
import { State } from './user-story.ts';

export interface StatEvent {
  time: number;
  leadTime: number;
}

const mean = (times: number[]) => {
  const somme = times.reduce((acc, val) => acc + val, 0);
  return somme / times.length;
};

const incrementTimeOfReferencedUserStories = (
  currentEvents: TimeEvent[],
  timesOfRunningUserStoriesByName: Map<string, number>,
) => {
  const uniqueUserStoryNames = new Set(
    currentEvents.map((event) => event.userStoryName),
  );
  const updatedTimesOfRunningUserStoriesByName = new Map<string, number>(
    timesOfRunningUserStoriesByName,
  );
  for (const userStoryName of uniqueUserStoryNames) {
    const currentTime =
      updatedTimesOfRunningUserStoriesByName.get(userStoryName) ?? 0;
    updatedTimesOfRunningUserStoriesByName.set(userStoryName, currentTime + 1);
  }
  return updatedTimesOfRunningUserStoriesByName;
};

export const computeStatEvents = (timeEvents: TimeEvent[]): StatEvent[] => {
  let timesOfRunningUserStoriesByName = new Map<string, number>();
  const dones: number[] = [];
  const statEvents = [];
  let time = 1;

  while (true) {
    const currentEvents = timeEvents.filter(
      (event: TimeEvent) => event.time == time,
    );
    if (currentEvents.length === 0) break;

    timesOfRunningUserStoriesByName = incrementTimeOfReferencedUserStories(
      currentEvents,
      timesOfRunningUserStoriesByName,
    );

    const uniqueUserStoryNamesDone = new Set(
      currentEvents
        .filter((event) => event.state === State.DONE)
        .map((event) => event.userStoryName),
    );
    for (const userStoryName of uniqueUserStoryNamesDone) {
      const items = timesOfRunningUserStoriesByName.get(userStoryName);
      if (items) dones.push(items);
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
