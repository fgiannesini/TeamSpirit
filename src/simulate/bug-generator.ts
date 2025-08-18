import { type Backlog, getUserStories, shouldGenerateBug } from './backlog.ts';
import type { Team } from './team.ts';
import type { UserStory } from './user-story.ts';

export const computeBugProbability = (
  complexity: number,
  turn: number,
  experience: number,
  reviewCount: number,
): number => {
  const maxExperience = 5;
  const experienceFactor = (6 - experience) / maxExperience;
  const maxComplexity = 5;
  const complexityFactor = complexity / maxComplexity;
  const baseProb = 0.4 * experienceFactor * complexityFactor;

  const duration = 2 + complexity;
  const mu = duration / 2;
  const sigma = duration / 2.5;
  const timeInfluence = Math.exp(-(((turn - mu) / sigma) ** 2));

  const reviewFactor = 1.5 * Math.exp(-0.4 * reviewCount);

  return baseProb * timeInfluence * reviewFactor;
};

export const getBugPriority = (
  userStoryPriority: number,
  priorityRandomProvider: () => number,
): number =>
  Math.max(
    0,
    userStoryPriority + (Math.floor(priorityRandomProvider() * 5) - 2),
  );

export type BugGenerator = {
  generate(backlog: Backlog, team: Team, time: number): UserStory[];
};

export const noBugGenerator: BugGenerator = {
  generate(_: Backlog, _2: Team, _3: number): UserStory[] {
    return [];
  },
};

export type BugGeneratorEvent = {
  complexity: number;
  reviewComplexity: number;
  time: number;
  priority: number;
};

export class CustomBugGenerator implements BugGenerator {
  private readonly bugEvents: BugGeneratorEvent[];
  private bugCount = 0;

  constructor(bugEvents: BugGeneratorEvent[]) {
    this.bugEvents = bugEvents;
  }

  generate(backlog: Backlog, _team: Team, time: number): UserStory[] {
    const userStoriesCount = getUserStories(backlog).length;
    return this.bugEvents
      .filter((bugEvent) => bugEvent.time === time)
      .map((bugEvent) => {
        const userStory: UserStory = {
          id: userStoriesCount + this.bugCount,
          name: `bug-${this.bugCount}`,
          complexity: bugEvent.complexity,
          progression: 0,
          review: {
            reviewers: new Map(),
            reviewComplexity: bugEvent.reviewComplexity,
          },
          state: 'Todo',
          threadId: undefined,
          timeDone: 0,
          priority: bugEvent.priority,
        };
        this.bugCount++;
        return userStory;
      });
  }
}
export class RandomBugGenerator implements BugGenerator {
  bugCount = 0;
  private readonly creationRandomProvider: () => number;
  private readonly complexityRandomProvider: () => number;
  private readonly priorityRandomProvider: () => number;
  constructor(
    creationRandomProvider: () => number,
    complexityRandomProvider: () => number,
    priorityRandomProvider: () => number,
  ) {
    this.creationRandomProvider = creationRandomProvider;
    this.complexityRandomProvider = complexityRandomProvider;
    this.priorityRandomProvider = priorityRandomProvider;
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
          priority: getBugPriority(
            userStory.priority,
            this.priorityRandomProvider,
          ),
        };
      });
  }
}
