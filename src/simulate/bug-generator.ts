import { type Backlog, getUserStories, shouldGenerateBug } from './backlog.ts';
import type { Team } from './team.ts';
import type { UserStory } from './user-story.ts';

export const computeBugProbability = (
  complexity: number,
  turn: number,
  experience: number,
): number => {
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

export type BugEvent = {
  complexity: number;
  reviewComplexity: number;
  time: number;
};
export class CustomBugGenerator implements BugGenerator {
  private readonly bugEvents: BugEvent[];
  constructor(bugEvents: BugEvent[]) {
    this.bugEvents = bugEvents;
  }
  generate(_backlog: Backlog, _team: Team, _time: number): UserStory[] {
    const bugEvent = this.bugEvents[0];
    return [
      {
        id: 0,
        name: 'user-story',
        complexity: bugEvent.complexity,
        progression: 0,
        review: {
          reviewers: new Map(),
          reviewComplexity: bugEvent.reviewComplexity,
        },
        state: 'Todo',
        threadId: undefined,
        timeDone: 0,
      },
    ];
  }
}
export class RandomBugGenerator implements BugGenerator {
  bugCount = 0;
  private readonly creationRandomProvider: () => number;
  private readonly complexityRandomProvider: () => number;
  constructor(
    creationRandomProvider: () => number,
    complexityRandomProvider: () => number,
  ) {
    this.creationRandomProvider = creationRandomProvider;
    this.complexityRandomProvider = complexityRandomProvider;
  }
  generate(backlog: Backlog, team: Team, time: number): UserStory[] {
    return backlog.userStoriesDone
      .map((userStory) =>
        shouldGenerateBug(this.creationRandomProvider, userStory, team, time)
          ? userStory
          : null,
      )
      .filter((result) => result !== null)
      .map((userStory, index): UserStory => {
        const id = getUserStories(backlog).length + index;
        const name = `bug-${this.bugCount++}`;
        const complexityRandom = this.complexityRandomProvider();
        return {
          id,
          name,
          complexity: Math.max(
            1,
            Math.floor(complexityRandom * userStory.complexity),
          ),
          progression: 0,
          review: {
            reviewComplexity: Math.max(
              1,
              Math.floor(complexityRandom * userStory.review.reviewComplexity),
            ),
            reviewers: new Map<number, number>(),
          },
          threadId: undefined,
          state: 'Todo',
          timeDone: 0,
        };
      });
  }
}
