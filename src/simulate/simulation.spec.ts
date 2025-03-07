import { describe, expect, test } from 'vitest';
import {
  Backlog,
  getUserStoriesDone,
  getUserStoriesRemainings,
} from './backlog.ts';
import { noReview } from './review.ts';
import { State } from './user-story.ts';
import { ParallelTeam } from './team.ts';
import { TimeEvent } from './events.ts';
import { simulate } from './simulation.ts';

describe('Simulation', () => {
  test('should handle 2 simple userStories by 2 devs', () => {
    const backlog = new Backlog([
      {
        name: 'userStory1',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      },
      {
        name: 'userStory2',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
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

    expect(getUserStoriesDone(backlog)).toHaveLength(2);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 1 simple userStory by an efficient dev', () => {
    const backlog = new Backlog([
      {
        name: 'userStory1',
        complexity: 5,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([{ id: 0, power: 2 }]);
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

    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 3 simple userStories by 2 devs', () => {
    const backlog = new Backlog([
      {
        name: 'userStory1',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      },
      {
        name: 'userStory2',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      },
      {
        name: 'userStory3',
        complexity: 1,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
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

    expect(getUserStoriesDone(backlog)).toHaveLength(3);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 2 complex userStories by 2 devs', () => {
    const backlog = new Backlog([
      {
        name: 'userStory1',
        complexity: 2,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      },
      {
        name: 'userStory2',
        complexity: 2,
        reviewComplexity: 0,
        review: noReview,
        state: State.TODO,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
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

    expect(getUserStoriesDone(backlog)).toHaveLength(2);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 1 simple userStory and review', () => {
    const backlog = new Backlog([
      {
        name: 'userStory0',
        complexity: 1,
        reviewComplexity: 2,
        review: {
          reviewersNeeded: 1,
          reviewers: new Map<number, number>(),
        },
        state: State.TODO,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
      { id: 0, power: 1 },
      { id: 1, power: 1 },
    ]);
    const events = simulate(backlog, team);

    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory0',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory0',
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
        userStoryName: 'userStory0',
        thread: 1,
        state: State.REVIEW,
      },
      {
        state: State.DONE,
        thread: 0,
        time: 3,
        userStoryName: 'idle',
      },
      {
        state: State.REVIEW,
        thread: 1,
        time: 3,
        userStoryName: 'userStory0',
      },
      {
        state: State.DONE,
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
      },
    ]);

    const team = new ParallelTeam([
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

    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 1 simple userStory and review by two devs', () => {
    const backlog = new Backlog([
      {
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
      },
    ]);

    const team = new ParallelTeam([
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

    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should handle 3 simple userStories by 3 devs and 2 reviews', () => {
    const backlog = new Backlog([
      {
        name: 'userStory0',
        complexity: 1,
        reviewComplexity: 1,
        review: {
          reviewersNeeded: 2,
          reviewers: new Map<number, number>(),
        },
        state: State.TODO,
        thread: undefined,
        progression: 0,
      },
      {
        name: 'userStory1',
        complexity: 1,
        reviewComplexity: 1,
        review: {
          reviewersNeeded: 2,
          reviewers: new Map<number, number>(),
        },
        state: State.TODO,
        thread: undefined,
        progression: 0,
      },
      {
        name: 'userStory2',
        complexity: 1,
        reviewComplexity: 1,
        review: {
          reviewersNeeded: 2,
          reviewers: new Map<number, number>(),
        },
        state: State.TODO,
        thread: undefined,
        progression: 0,
      },
    ]);

    const team = new ParallelTeam([
      { id: 0, power: 1 },
      { id: 1, power: 1 },
      { id: 2, power: 1 },
    ]);
    const events = simulate(backlog, team);
    expect(events).toEqual([
      {
        state: State.IN_PROGRESS,
        thread: 0,
        time: 1,
        userStoryName: 'userStory0',
      },
      {
        state: State.TO_REVIEW,
        thread: 0,
        time: 1,
        userStoryName: 'userStory0',
      },
      {
        state: State.IN_PROGRESS,
        thread: 1,
        time: 1,
        userStoryName: 'userStory1',
      },
      {
        state: State.TO_REVIEW,
        thread: 1,
        time: 1,
        userStoryName: 'userStory1',
      },
      {
        state: State.IN_PROGRESS,
        thread: 2,
        time: 1,
        userStoryName: 'userStory2',
      },
      {
        state: State.TO_REVIEW,
        thread: 2,
        time: 1,
        userStoryName: 'userStory2',
      },
      {
        state: State.REVIEW,
        thread: 0,
        time: 2,
        userStoryName: 'userStory1',
      },
      {
        state: State.REVIEW,
        thread: 1,
        time: 2,
        userStoryName: 'userStory0',
      },
      {
        state: State.REVIEW,
        thread: 2,
        time: 2,
        userStoryName: 'userStory1',
      },
      {
        state: State.DONE,
        thread: 1,
        time: 2,
        userStoryName: 'userStory1',
      },
      {
        state: State.TO_REVIEW,
        thread: 0,
        time: 2,
        userStoryName: 'userStory0',
      },
      {
        state: State.REVIEW,
        thread: 0,
        time: 3,
        userStoryName: 'userStory2',
      },
      {
        state: State.REVIEW,
        thread: 1,
        time: 3,
        userStoryName: 'userStory2',
      },
      {
        state: State.DONE,
        thread: 2,
        time: 3,
        userStoryName: 'userStory2',
      },
      {
        state: State.REVIEW,
        thread: 2,
        time: 3,
        userStoryName: 'userStory0',
      },
      {
        state: State.DONE,
        thread: 0,
        time: 3,
        userStoryName: 'userStory0',
      },
    ]);

    expect(getUserStoriesDone(backlog)).toHaveLength(3);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });
});
