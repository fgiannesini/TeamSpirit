import {
  type Backlog,
  addUserStory,
  getUserStories,
  hasMoreUserStories,
  shouldGenerateBug,
} from './backlog.ts';
import type { TimeEvent } from './events.ts';
import { noReview } from './review.ts';
import { structureEventsOnInitialization } from './simulation-structure.ts';
import { simulateTimeEvents } from './simulation-time.ts';
import type { Team } from './team.ts';
import type { UserStory } from './user-story.ts';

export const simulate = (
  backlog: Backlog,
  team: Team,
  randomProvider: () => number,
) => {
  const timeEvents: TimeEvent[] = [];
  let time = 1;
  const structureEvents = structureEventsOnInitialization(backlog, team);
  const bugGeneratorHandler = new BugGeneratorHandler(randomProvider);
  while (hasMoreUserStories(backlog)) {
    bugGeneratorHandler.generate(backlog, team, time).forEach((userStory) => {
      structureEvents.push({
        time,
        name: userStory.name,
        id: userStory.id,
        action: 'CreateUserStory',
      });
      addUserStory(userStory, backlog);
    });

    timeEvents.push(...simulateTimeEvents(team, backlog, time));
    time++;
  }
  return { timeEvents, structureEvents };
};

type BugGenerator = {
  generate(backlog: Backlog, team: Team, time: number): UserStory[];
};

class BugGeneratorHandler implements BugGenerator {
  bugCount = 0;
  constructor(private readonly randomProvider: () => number) {}
  generate(backlog: Backlog, team: Team, time: number): UserStory[] {
    return backlog.userStoriesDone
      .map((userStory) =>
        shouldGenerateBug(this.randomProvider, userStory, team, time),
      )
      .filter((result) => result)
      .map(() => {
        const id = getUserStories(backlog).length;
        const name = `bug-${this.bugCount}`;
        this.bugCount++;
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
