import type { UserStory } from './user-story.ts';

type JumpParams = {
  pChange: number;
  sigma: number;
};

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
  stories: UserStory[],
  params: JumpParams,
  randomProvider: () => number,
): UserStory[] => {
  const { pChange, sigma } = params;
  return stories.map((s) => {
    if (randomProvider() >= pChange) {
      return s;
    }
    const next = sampleTruncatedNormalInt(s.priority, sigma, randomProvider);
    return { ...s, priority: next };
  });
};

export type PriorityModificator = {
  generate(userStories: UserStory[], time: number): UserStory[];
};

export const noPriorityModificator: PriorityModificator = {
  generate(_userStories: UserStory[], _time: number): UserStory[] {
    return [];
  },
};

export class RandomPriorityModificator implements PriorityModificator {
  private readonly randomGenerator: () => number;
  constructor(randomGenerator: () => number) {
    this.randomGenerator = randomGenerator;
  }
  generate(_userStories: UserStory[], _time: number): UserStory[] {
    this.randomGenerator();
    return [];
  }
}

export type PriorityModificatorEvent = {
  time: number;
  id: number;
  priority: number;
};
export class CustomPriorityModificator implements PriorityModificator {
  constructor(_events: PriorityModificatorEvent[]) {}
  generate(_userStories: UserStory[], _time: number): UserStory[] {
    return [];
  }
}
