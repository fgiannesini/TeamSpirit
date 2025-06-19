import { describe, expect, test } from 'vitest';
import {
  addUserStory,
  Backlog,
  getUserStoriesDone,
  getUserStoriesRemainings,
} from './backlog.ts';
import type { BugGenerator } from './bug-generator.ts';
import { done, todo } from './factory.ts';
import { simulate } from './simulation.ts';
import { EnsembleTeam, type Team } from './team.ts';
import type { UserStory } from './user-story.ts';

describe('Simulation', () => {
  const noBugGenerator: BugGenerator = {
    generate(_: Backlog, _2: Team, _3: number): UserStory[] {
      return [];
    },
  };

  test('Should have one thread developing a user story', () => {
    const team = new EnsembleTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([
      todo({
        complexity: 2,
      }),
    ]);
    const { timeEvents } = simulate(backlog, team, noBugGenerator);
    expect(timeEvents.pop()?.time).toEqual(2);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should build structure events on initialization', () => {
    const team = new EnsembleTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([
      todo({
        complexity: 2,
      }),
    ]);

    const { structureEvents } = simulate(backlog, team, noBugGenerator);
    expect(structureEvents.length).toBeGreaterThan(0);
  });

  test('Should generate a bug during the first and second turn', () => {
    const team = new EnsembleTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([
      todo({
        id: 1,
        name: 'US1',
        complexity: 1,
      }),
    ]);
    addUserStory(done({ id: 0, name: 'US0' }), backlog);
    const bugGenerator: BugGenerator = {
      generate(_: Backlog, _2: Team, time: number): UserStory[] {
        if (time === 1) {
          return [todo({ id: 1, name: 'bug-0' })];
        }
        return [];
      },
    };

    const { structureEvents } = simulate(backlog, team, bugGenerator);
    expect(structureEvents.slice(-1)).toEqual([
      {
        id: 1,
        name: 'bug-0',
        time: 1,
        action: 'CreateUserStory',
      },
    ]);
    expect(backlog.userStoriesDone.length).toEqual(3);
  });
});
