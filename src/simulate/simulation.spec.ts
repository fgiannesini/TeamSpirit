import { describe, expect, test } from 'vitest';
import {
  Backlog,
  getUserStoriesDone,
  getUserStoriesRemainings,
} from './backlog.ts';
import type { TimeEvent } from './events.ts';
import { noReview } from './review.ts';
import { simulate } from './simulation.ts';
import { ParallelTeam } from './team.ts';
import { State } from './user-story.ts';

describe('Simulation', () => {
  test('should handle 2 simple userStories by 2 devs', () => {
    const backlog = new Backlog([
      {
        id: 1,
        name: 'userStory1',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
      {
        id: 2,
        name: 'userStory2',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
      { id: 0, name: 'thread0', power: 1 },
      { id: 1, name: 'thread1', power: 1 },
    ]);
    const events = simulate(backlog, team);

    expect(events).toEqual<TimeEvent[]>([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.InProgress,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.Done,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.InProgress,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.Done,
      },
    ]);

    expect(getUserStoriesDone(backlog)).toHaveLength(2);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 1 simple userStory by an efficient dev', () => {
    const backlog = new Backlog([
      {
        id: 1,
        name: 'userStory1',
        complexity: 5,
        reviewComplexity: 0,
        review: noReview,
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([{ id: 0, name: 'thread0', power: 2 }]);
    const events = simulate(backlog, team);

    expect(events).toEqual<TimeEvent[]>([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.InProgress,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.InProgress,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.InProgress,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.Done,
      },
    ]);

    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 3 simple userStories by 2 devs', () => {
    const backlog = new Backlog([
      {
        id: 1,
        name: 'userStory1',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
      {
        id: 2,
        name: 'userStory2',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
      {
        id: 3,
        name: 'userStory3',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
      { id: 0, name: 'thread0', power: 1 },
      { id: 1, name: 'thread1', power: 1 },
    ]);
    const events = simulate(backlog, team);
    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.InProgress,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.Done,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.InProgress,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.Done,
      },
      {
        time: 2,
        userStoryName: 'userStory3',
        thread: 0,
        state: State.InProgress,
      },
      {
        time: 2,
        userStoryName: 'userStory3',
        thread: 0,
        state: State.Done,
      },
      {
        time: 2,
        userStoryName: 'idle',
        thread: 1,
        state: State.Done,
      },
    ]);

    expect(getUserStoriesDone(backlog)).toHaveLength(3);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 2 complex userStories by 2 devs', () => {
    const backlog = new Backlog([
      {
        id: 1,
        name: 'userStory1',
        complexity: 2,
        reviewComplexity: 0,
        review: noReview,
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
      {
        id: 2,
        name: 'userStory2',
        complexity: 2,
        reviewComplexity: 0,
        review: noReview,
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
      { id: 0, name: 'thread0', power: 1 },
      { id: 1, name: 'thread1', power: 1 },
    ]);
    const events = simulate(backlog, team);
    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.InProgress,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.InProgress,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.InProgress,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.Done,
      },
      {
        time: 2,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.InProgress,
      },
      {
        time: 2,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.Done,
      },
    ]);

    expect(getUserStoriesDone(backlog)).toHaveLength(2);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 1 simple userStory and review', () => {
    const backlog = new Backlog([
      {
        id: 0,
        name: 'userStory0',
        complexity: 1,
        reviewComplexity: 2,
        review: {
          reviewersNeeded: 1,
          reviewers: new Map<number, number>(),
        },
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
      { id: 0, name: 'thread0', power: 1 },
      { id: 1, name: 'thread1', power: 1 },
    ]);
    const events = simulate(backlog, team);

    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory0',
        thread: 0,
        state: State.InProgress,
      },
      {
        time: 1,
        userStoryName: 'userStory0',
        thread: 0,
        state: State.ToReview,
      },
      {
        time: 1,
        userStoryName: 'idle',
        thread: 1,
        state: State.Done,
      },
      {
        time: 2,
        userStoryName: 'idle',
        thread: 0,
        state: State.Done,
      },
      {
        time: 2,
        userStoryName: 'userStory0',
        thread: 1,
        state: State.Review,
      },
      {
        state: State.Done,
        thread: 0,
        time: 3,
        userStoryName: 'idle',
      },
      {
        state: State.Review,
        thread: 1,
        time: 3,
        userStoryName: 'userStory0',
      },
      {
        state: State.Done,
        thread: 0,
        time: 3,
        userStoryName: 'userStory0',
      },
    ]);

    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 1 simple userStory and review by an efficient dev', () => {
    const backlog = new Backlog([
      {
        id: 1,
        name: 'userStory1',
        complexity: 20,
        reviewComplexity: 2,
        review: {
          reviewersNeeded: 1,
          reviewers: new Map<number, number>(),
        },
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
      {
        id: 0,
        name: 'thread0',
        power: 20,
      },
      {
        id: 1,
        name: 'thread1',
        power: 1,
      },
    ]);
    const events = simulate(backlog, team);

    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.InProgress,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.ToReview,
      },
      {
        time: 1,
        userStoryName: 'idle',
        thread: 1,
        state: State.Done,
      },
      {
        time: 2,
        userStoryName: 'idle',
        thread: 0,
        state: State.Done,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.Review,
      },
      {
        time: 3,
        userStoryName: 'idle',
        thread: 0,
        state: State.Done,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.Review,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.Done,
      },
    ]);

    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 1 simple userStory and review by two devs', () => {
    const backlog = new Backlog([
      {
        id: 1,
        name: 'userStory1',
        complexity: 20,
        reviewComplexity: 2,
        review: {
          reviewersNeeded: 2,
          reviewers: new Map<number, number>(),
        },
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
      {
        id: 0,
        name: 'thread0',
        power: 20,
      },
      {
        id: 1,
        name: 'thread1',
        power: 1,
      },
      {
        id: 2,
        name: 'thread2',
        power: 1,
      },
    ]);
    const events = simulate(backlog, team);

    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.InProgress,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.ToReview,
      },
      {
        time: 1,
        userStoryName: 'idle',
        thread: 1,
        state: State.Done,
      },
      {
        time: 1,
        userStoryName: 'idle',
        thread: 2,
        state: State.Done,
      },
      {
        time: 2,
        userStoryName: 'idle',
        thread: 0,
        state: State.Done,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.Review,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 2,
        state: State.Review,
      },
      {
        time: 3,
        userStoryName: 'idle',
        thread: 0,
        state: State.Done,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.Review,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 2,
        state: State.Review,
      },
      {
        time: 3,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.Done,
      },
    ]);

    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 3 simple userStories by 3 devs and 2 reviews', () => {
    const backlog = new Backlog([
      {
        id: 0,
        name: 'userStory0',
        complexity: 1,
        reviewComplexity: 1,
        review: {
          reviewersNeeded: 2,
          reviewers: new Map<number, number>(),
        },
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
      {
        id: 1,
        name: 'userStory1',
        complexity: 1,
        reviewComplexity: 1,
        review: {
          reviewersNeeded: 2,
          reviewers: new Map<number, number>(),
        },
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
      {
        id: 2,
        name: 'userStory2',
        complexity: 1,
        reviewComplexity: 1,
        review: {
          reviewersNeeded: 2,
          reviewers: new Map<number, number>(),
        },
        state: State.Todo,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
      { id: 0, name: 'thread1', power: 1 },
      { id: 1, name: 'thread2', power: 1 },
      { id: 2, name: 'thread3', power: 1 },
    ]);
    const events = simulate(backlog, team);
    expect(events).toEqual([
      {
        state: State.InProgress,
        thread: 0,
        time: 1,
        userStoryName: 'userStory0',
      },
      {
        state: State.ToReview,
        thread: 0,
        time: 1,
        userStoryName: 'userStory0',
      },
      {
        state: State.InProgress,
        thread: 1,
        time: 1,
        userStoryName: 'userStory1',
      },
      {
        state: State.ToReview,
        thread: 1,
        time: 1,
        userStoryName: 'userStory1',
      },
      {
        state: State.InProgress,
        thread: 2,
        time: 1,
        userStoryName: 'userStory2',
      },
      {
        state: State.ToReview,
        thread: 2,
        time: 1,
        userStoryName: 'userStory2',
      },
      {
        state: State.Review,
        thread: 0,
        time: 2,
        userStoryName: 'userStory1',
      },
      {
        state: State.Review,
        thread: 1,
        time: 2,
        userStoryName: 'userStory0',
      },
      {
        state: State.Review,
        thread: 2,
        time: 2,
        userStoryName: 'userStory1',
      },
      {
        state: State.Done,
        thread: 1,
        time: 2,
        userStoryName: 'userStory1',
      },
      {
        state: State.ToReview,
        thread: 0,
        time: 2,
        userStoryName: 'userStory0',
      },
      {
        state: State.Review,
        thread: 0,
        time: 3,
        userStoryName: 'userStory2',
      },
      {
        state: State.Review,
        thread: 1,
        time: 3,
        userStoryName: 'userStory2',
      },
      {
        state: State.Done,
        thread: 2,
        time: 3,
        userStoryName: 'userStory2',
      },
      {
        state: State.Review,
        thread: 2,
        time: 3,
        userStoryName: 'userStory0',
      },
      {
        state: State.Done,
        thread: 0,
        time: 3,
        userStoryName: 'userStory0',
      },
    ]);

    expect(getUserStoriesDone(backlog)).toHaveLength(3);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });
});
