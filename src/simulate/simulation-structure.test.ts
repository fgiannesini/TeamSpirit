import {describe, expect, test} from 'vitest';
import {createBacklog, createThread, todo} from './factory.ts';
import {type StructureEvent, structureEventsOnInitialization,} from './simulation-structure.ts';
import {ParallelTeam} from './team.ts';

describe('simulation-structure', () => {
  test('should create 2 user stories and 2 threads', () => {
    const backlog = createBacklog({userStoriesRemaining: [
      todo({
        id: 0,
        name: 'userStory0',
      }),
      todo({
        id: 1,
        name: 'userStory1',
        priority: 1,
      }),
    ]});

    const team = new ParallelTeam([
      createThread({ id: 0, name: 'thread0', power: 1 }),
      createThread({ id: 1, name: 'thread1', power: 1 }),
    ]);
    const events = structureEventsOnInitialization(backlog, team);

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
        id: 0,
        value: 0,
        action: 'ChangePriority',
      },
      {
        time: 1,
        id: 1,
        name: 'userStory1',
        action: 'CreateUserStory',
      },
      {
        time: 1,
        id: 1,
        value: 1,
        action: 'ChangePriority',
      },
    ]);
  });
});
