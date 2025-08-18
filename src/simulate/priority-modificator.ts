import type { UserStory } from './user-story.ts';

export type PriorityModificator = {
  generate(userStories: UserStory[], time: number): UserStory[];
};

export const noPriorityModificator: PriorityModificator = {
  generate(_userStories: UserStory[], _time: number): UserStory[] {
    return [];
  },
};

export class RandomPriorityModificator implements PriorityModificator {
  generate(_userStories: UserStory[], _time: number): UserStory[] {
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
