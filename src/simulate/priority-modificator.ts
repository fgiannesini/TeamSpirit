import type { UserStory } from './user-story.ts';

const sampleTruncatedNormalInt = (
  mean: number,
  sigma: number,
  randomProvider: () => number,
): number => {
  // Box-Muller pour une N(0,1)
  const u1 = randomProvider();
  const u2 = randomProvider();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const x = mean + sigma * z;
  if (x < 0) {
    return 0;
  }
  if (x > 10) {
    return 10;
  }
  return Math.round(x);
};

export const tickJump = (
  priority: number,
  randomProvider: () => number,
): number => {
  if (randomProvider() >= 0.08) {
    return priority;
  }
  return sampleTruncatedNormalInt(priority, 1, randomProvider);
};

export type PriorityModificator = {
  generate(
    userStories: UserStory[],
    time: number,
  ): {
    userStories: UserStory[];
    modifications: Pick<UserStory, 'id' | 'priority'>[];
  };
};

export const noPriorityModificator: PriorityModificator = {
  generate(
    _userStories: UserStory[],
    _time: number,
  ): {
    userStories: UserStory[];
    modifications: Pick<UserStory, 'id' | 'priority'>[];
  } {
    return {
      userStories: [],
      modifications: [],
    };
  },
};

export class RandomPriorityModificator implements PriorityModificator {
  private readonly randomGenerator: () => number;
  constructor(randomGenerator: () => number) {
    this.randomGenerator = randomGenerator;
  }
  generate(
    userStories: UserStory[],
    _time: number,
  ): {
    userStories: UserStory[];
    modifications: Pick<UserStory, 'id' | 'priority'>[];
  } {
    const modifications: Pick<UserStory, 'id' | 'priority'>[] = [];
    const newUserStories = userStories.map((userStory) => {
      const newPriority = tickJump(userStory.priority, this.randomGenerator);
      if (newPriority !== userStory.priority) {
        modifications.push({
          id: userStory.id,
          priority: newPriority,
        });
        return { ...userStory, priority: newPriority };
      }
      return userStory;
    });
    return {
      userStories: newUserStories,
      modifications,
    };
  }
}

export type PriorityModificatorEvent = {
  time: number;
  id: number;
  priority: number;
};
export class CustomPriorityModificator implements PriorityModificator {
  readonly events: PriorityModificatorEvent[] = [];
  constructor(events: PriorityModificatorEvent[]) {
    this.events = events;
  }
  generate(
    userStories: UserStory[],
    time: number,
  ): {
    userStories: UserStory[];
    modifications: Pick<UserStory, 'id' | 'priority'>[];
  } {
    const eventsOnTime = this.events.filter((event) => event.time === time);
    const modifications: Pick<UserStory, 'id' | 'priority'>[] = [];
    const newUserStories = userStories.map((userStory) => {
      const event = eventsOnTime.find((e) => e.id === userStory.id);
      if (event && event.priority !== userStory.priority) {
        modifications.push({
          id: userStory.id,
          priority: event.priority,
        });
        return { ...userStory, priority: event.priority };
      }
      return userStory;
    });
    return {
      userStories: newUserStories,
      modifications,
    };
  }
}
