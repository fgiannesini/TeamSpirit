import { type Backlog, getUserStories, shouldGenerateBug } from './backlog.ts';
import { noReview } from './review.ts';
import type { Team } from './team.ts';
import type { UserStory } from './user-story.ts';

export const computeBugProbability = (
  complexity: number,
  turn: number,
  experience: number,
) => {
  const duration = 2 + complexity;
  const mu = duration / 2;
  const sigma = duration / 2.5;
  const timeInfluence = Math.exp(-(((turn - mu) / sigma) ** 2));

  const maxExperience = 5;
  const experienceFactor = (6 - experience) / maxExperience;
  const maxComplexity = 5;
  const complexityFactor = complexity / maxComplexity;

  const baseProb = 0.4 * experienceFactor * complexityFactor;

  return baseProb * timeInfluence;
};

export type BugGenerator = {
  generate(backlog: Backlog, team: Team, time: number): UserStory[];
};

export class BugGeneratorHandler implements BugGenerator {
  bugCount = 0;
  constructor(private readonly randomProvider: () => number) {}
  generate(backlog: Backlog, team: Team, time: number): UserStory[] {
    return backlog.userStoriesDone
      .map((userStory) =>
        shouldGenerateBug(this.randomProvider, userStory, team, time),
      )
      .filter((result) => result)
      .map((_, index) => {
        const id = getUserStories(backlog).length + index;
        const name = `bug-${this.bugCount++}`;
        return {
          id,
          name,
          complexity: 1,
          reviewComplexity: 1,
          progression: 0,
          review: noReview,
          threadId: undefined,
          state: 'Todo',
          timeDone: 0,
        };
      });
  }
}
