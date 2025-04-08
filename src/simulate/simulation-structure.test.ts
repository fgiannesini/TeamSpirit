import { describe, expect, test } from 'vitest';
import { Backlog } from './backlog.ts';
import { noReview } from './review.ts';
import { type Action, simulateStructure } from './simulation-structure.ts';
import { ParallelTeam } from './team.ts';
import { State } from './user-story.ts';

interface StructureEvent {
  time: number;
  action: Action;
  id: number;
  name: string;
}

describe('simulation-structure', () => {
  test('should create 2 user stories and 2 threads', () => {
    const backlog = new Backlog([
      {
        id: 0,
        name: 'userStory0',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.Todo,
        threadId: undefined,
        progression: 0,
      },
      {
        id: 1,
        name: 'userStory1',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.Todo,
        threadId: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
      { id: 0, name: 'thread0', power: 1 },
      { id: 1, name: 'thread1', power: 1 },
    ]);
    const events = simulateStructure(backlog, team);

    expect(events).toEqual<StructureEvent[]>([
      {
        time: 1,
        id: 0,
        name: 'thread0',
        action: 'CreateThread',
      },
      {
        time: 1,
        id: 1,
        name: 'thread1',
        action: 'CreateThread',
      },
      {
        time: 1,
        id: 0,
        name: 'userStory0',
        action: 'CreateUserStory',
      },
      {
        time: 1,
        id: 1,
        name: 'userStory1',
        action: 'CreateUserStory',
      },
    ]);
  });
});
