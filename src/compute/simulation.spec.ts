import { describe, expect, test } from 'vitest';
import { Backlog } from './backlog.ts';
import { noReview } from './review.ts';
import { State } from './user-story.ts';
import { Team } from './team.ts';
import { TimeEvent } from './events.ts';
import { simulate } from './simulation.ts';

describe('Simulation', () => {
  test('should handle 2 simple userStories by 2 devs', () => {
    const backlog = Backlog.init()
      .addUserStory({
        name: 'userStory1',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      })
      .addUserStory({
        name: 'userStory2',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      })
      .build();

    const team = new Team([
      { id: 0, power: 1 },
      { id: 1, power: 1 },
    ]);
    const events = simulate(backlog, team);

    expect(events).toEqual<TimeEvent[]>([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(2);
    expect(backlog.remainings()).toHaveLength(0);
  });

  test('should handle 1 simple userStory by an efficient dev', () => {
    const backlog = Backlog.init()
      .addUserStory({
        name: 'userStory1',
        complexity: 5,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      })
      .build();

    const team = new Team([{ id: 0, power: 2 }]);
    const events = simulate(backlog, team);

    expect(events).toEqual<TimeEvent[]>([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(1);
    expect(backlog.remainings()).toHaveLength(0);
  });

  test('should handle 3 simple userStories by 2 devs', () => {
    const backlog = Backlog.init()
      .addUserStory({
        name: 'userStory1',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      })
      .addUserStory({
        name: 'userStory2',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      })
      .addUserStory({
        name: 'userStory3',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      })
      .build();

    const team = new Team([
      { id: 0, power: 1 },
      { id: 1, power: 1 },
    ]);
    const events = simulate(backlog, team);
    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'userStory3',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 2,
        userStoryName: 'userStory3',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'idle',
        thread: 1,
        state: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(3);
    expect(backlog.remainings()).toHaveLength(0);
  });

  test('should handle 2 complex userStories by 2 devs', () => {
    const backlog = Backlog.init()
      .addUserStory({
        name: 'userStory1',
        complexity: 2,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      })
      .addUserStory({
        name: 'userStory2',
        complexity: 2,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      })
      .build();

    const team = new Team([
      { id: 0, power: 1 },
      { id: 1, power: 1 },
    ]);
    const events = simulate(backlog, team);
    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.IN_PROGRESS,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.IN_PROGRESS,
      },
      {
        time: 2,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(2);
    expect(backlog.remainings()).toHaveLength(0);
  });

  test('should handle 1 simple userStory and review', () => {
    const backlog = Backlog.init()
      .addUserStory({
        name: 'userStory1',
        complexity: 1,
        reviewComplexity: 1,
        review: {
          reviewersNeeded: 1,
          reviewers: new Map<number, number>(),
        },
        state: State.TODO,
        thread: undefined,
        progression: 0,
      })
      .build();

    const team = new Team([
      { id: 0, power: 1 },
      { id: 1, power: 1 },
    ]);
    const events = simulate(backlog, team);

    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.TO_REVIEW,
      },
      {
        time: 1,
        userStoryName: 'idle',
        thread: 1,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'idle',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.REVIEW,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(1);
    expect(backlog.remainings()).toHaveLength(0);
  });

  test('should handle 1 simple userStory and review by an efficient dev', () => {
    const backlog = Backlog.init()
      .addUserStory({
        name: 'userStory1',
        complexity: 20,
        reviewComplexity: 2,
        review: {
          reviewersNeeded: 1,
          reviewers: new Map<number, number>(),
        },
        state: State.TODO,
        thread: undefined,
        progression: 0,
      })
      .build();

    const team = new Team([
      {
        id: 0,
        power: 20,
      },
      {
        id: 1,
        power: 1,
      },
    ]);
    const events = simulate(backlog, team);

    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.TO_REVIEW,
      },
      {
        time: 1,
        userStoryName: 'idle',
        thread: 1,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'idle',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.REVIEW,
      },
      {
        time: 3,
        userStoryName: 'idle',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.REVIEW,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(1);
    expect(backlog.remainings()).toHaveLength(0);
  });

  test('should handle 1 simple userStory and review by two devs', () => {
    const backlog = Backlog.init()
      .addUserStory({
        name: 'userStory1',
        complexity: 20,
        reviewComplexity: 2,
        review: {
          reviewersNeeded: 2,
          reviewers: new Map<number, number>(),
        },
        state: State.TODO,
        thread: undefined,
        progression: 0,
      })
      .build();

    const team = new Team([
      {
        id: 0,
        power: 20,
      },
      {
        id: 1,
        power: 1,
      },
      {
        id: 2,
        power: 1,
      },
    ]);
    const events = simulate(backlog, team);

    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.TO_REVIEW,
      },
      {
        time: 1,
        userStoryName: 'idle',
        thread: 1,
        state: State.DONE,
      },
      {
        time: 1,
        userStoryName: 'idle',
        thread: 2,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'idle',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.REVIEW,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 2,
        state: State.REVIEW,
      },
      {
        time: 3,
        userStoryName: 'idle',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.REVIEW,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 2,
        state: State.REVIEW,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(1);
    expect(backlog.remainings()).toHaveLength(0);
  });
});
