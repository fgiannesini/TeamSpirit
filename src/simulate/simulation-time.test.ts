import { describe, expect, test } from 'vitest';
import { getUserStoriesDone, getUserStoriesRemainings } from './backlog.ts';
import {
  createBacklog,
  createThread,
  done,
  doneEvent,
  ensembleTeam,
  idleEvent,
  inProgress,
  inProgressEvent,
  parallelTeam,
  reviewEvent,
  todo,
  todoEvent,
  toReview,
  toReviewEvent,
} from './factory.ts';
import { noReview } from './review.ts';
import { simulateTimeEvents } from './simulation-time.ts';
import { ParallelTeam } from './team.ts';

describe('simulation time', () => {
  test('should have a thread idle', () => {
    const team = new ParallelTeam([createThread({ id: 0, power: 1 })]);
    const backlog = createBacklog({ userStoriesRemaining: [] });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([idleEvent()]);
  });

  test('should have two threads idle', () => {
    const team = new ParallelTeam([
      createThread({ id: 0, power: 1 }),
      createThread({ id: 1, power: 1 }),
    ]);
    const backlog = createBacklog({ userStoriesRemaining: [] });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      idleEvent({ threadId: 0 }),
      idleEvent({ threadId: 1 }),
    ]);
  });

  test('should have a thread develop and done a user story', () => {
    const team = new ParallelTeam([createThread({ id: 0, power: 1 })]);
    const backlog = createBacklog({ userStoriesRemaining: [todo()] });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([inProgressEvent(), doneEvent()]);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should have a thread develop a user story', () => {
    const team = new ParallelTeam([createThread({ id: 0, power: 1 })]);
    const backlog = createBacklog({
      userStoriesRemaining: [todo({ complexity: 3 })],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([inProgressEvent()]);
    expect(getUserStoriesDone(backlog)).toHaveLength(0);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(1);
  });

  test('should have an efficient thread develop a complex user story', () => {
    const team = new ParallelTeam([createThread({ id: 0, power: 3 })]);
    const backlog = createBacklog({
      userStoriesRemaining: [todo({ complexity: 3 })],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([inProgressEvent(), doneEvent()]);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should have a thread develop a user story with review', () => {
    const team = parallelTeam([
      createThread({ id: 0, power: 1 }),
      createThread({ id: 1 }),
    ]);
    const backlog = createBacklog({
      userStoriesRemaining: [
        todo({
          review: {
            reviewComplexity: 1,
            reviewers: new Map(),
          },
        }),
      ],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      inProgressEvent(),
      toReviewEvent(),
      idleEvent({ threadId: 1 }),
    ]);
    expect(getUserStoriesDone(backlog)).toHaveLength(0);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(1);
  });

  test('Should have an experimented thread develop a complex user story with review', () => {
    const team = new ParallelTeam([
      createThread({ id: 0, power: 3 }),
      createThread({ id: 1 }),
    ]);
    const backlog = createBacklog({
      userStoriesRemaining: [
        todo({
          complexity: 3,
          review: {
            reviewComplexity: 1,
            reviewers: new Map(),
          },
        }),
      ],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      inProgressEvent(),
      toReviewEvent(),
      idleEvent({ threadId: 1 }),
    ]);
    expect(getUserStoriesDone(backlog)).toHaveLength(0);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(1);
  });

  test('Should have a thread review a user story', () => {
    const team = new ParallelTeam([
      createThread({ id: 0, power: 1 }),
      createThread({ id: 1 }),
    ]);
    const backlog = createBacklog({
      userStoriesRemaining: [
        toReview({
          threadId: 1,
          review: {
            reviewComplexity: 1,
            reviewers: new Map(),
          },
        }),
      ],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      reviewEvent(),
      doneEvent({ threadId: 1 }),
      idleEvent({ threadId: 1 }),
    ]);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should have a thread review a complex user story', () => {
    const team = parallelTeam([
      createThread({ id: 0, power: 1 }),
      createThread({ id: 1 }),
    ]);
    const backlog = createBacklog({
      userStoriesRemaining: [
        toReview({
          threadId: 1,
          review: {
            reviewComplexity: 2,
            reviewers: new Map(),
          },
        }),
      ],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([reviewEvent(), idleEvent({ threadId: 1 })]);
    expect(getUserStoriesDone(backlog)).toHaveLength(0);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(1);
  });

  test('Should have an experimented thread review a simple user story', () => {
    const team = new ParallelTeam([
      createThread({ id: 0, power: 3 }),
      createThread({ id: 1 }),
    ]);
    const backlog = createBacklog({
      userStoriesRemaining: [
        toReview({
          threadId: 1,
          review: {
            reviewComplexity: 1,
            reviewers: new Map(),
          },
        }),
      ],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      reviewEvent(),
      doneEvent({ threadId: 1 }),
      idleEvent({ threadId: 1 }),
    ]);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should have a thread review a partially reviewed user story', () => {
    const team = new ParallelTeam([
      createThread({ id: 0, power: 3 }),
      createThread({ id: 1 }),
      createThread({ id: 2 }),
    ]);
    const backlog = createBacklog({
      userStoriesRemaining: [
        toReview({
          threadId: 1,
          review: {
            reviewComplexity: 1,
            reviewers: new Map([[2, 1]]),
          },
        }),
      ],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      reviewEvent(),
      doneEvent({ threadId: 1 }),
      idleEvent({ threadId: 1 }),
      idleEvent({ threadId: 2 }),
    ]);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should have two threads review a user story', () => {
    const team = parallelTeam([
      createThread({ id: 0, power: 1 }),
      createThread({ id: 1, power: 1 }),
      createThread({ id: 2, power: 1 }),
    ]);
    const backlog = createBacklog({
      userStoriesRemaining: [
        toReview({
          threadId: 2,
          review: {
            reviewComplexity: 1,
            reviewers: new Map(),
          },
        }),
      ],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      reviewEvent({ threadId: 0 }),
      reviewEvent({ threadId: 1 }),
      doneEvent({ threadId: 2 }),
      idleEvent({ threadId: 2 }),
    ]);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should have two threads review partially a user story', () => {
    const team = parallelTeam([
      createThread({ id: 0, power: 3 }),
      createThread({ id: 1, power: 1 }),
      createThread({ id: 2, power: 1 }),
    ]);
    const backlog = createBacklog({
      userStoriesRemaining: [
        toReview({
          threadId: 2,
          review: {
            reviewComplexity: 3,
            reviewers: new Map(),
          },
        }),
      ],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      reviewEvent({ threadId: 0 }),
      reviewEvent({ threadId: 1 }),
      idleEvent({ threadId: 2 }),
    ]);
    expect(getUserStoriesDone(backlog)).toHaveLength(0);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(1);
  });

  test('Should have a user story with reviewers when done by an ensemble team', () => {
    const team = ensembleTeam([
      createThread({ id: 0, power: 1 }),
      createThread({ id: 1, power: 1 }),
    ]);
    const backlog = createBacklog({
      userStoriesRemaining: [
        todo({
          threadId: 2,
          review: {
            reviewComplexity: 1,
            reviewers: new Map(),
          },
        }),
      ],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      inProgressEvent({ threadId: 0 }),
      doneEvent({ threadId: 0 }),
    ]);
    expect(getUserStoriesDone(backlog)).toStrictEqual([
      done({
        review: {
          reviewComplexity: 1,
          reviewers: new Map([[1, 1]]),
        },
      }),
    ]);
  });

  test('Should have the most experienced thread choose first the user stories', () => {
    const team = parallelTeam(
      [createThread({ id: 0, power: 1 }), createThread({ id: 1, power: 5 })],
      0,
    );
    const backlog = createBacklog({
      userStoriesRemaining: [
        todo({
          id: 0,
          complexity: 1,
          review: noReview,
        }),
        todo({
          id: 1,
          complexity: 1,
          review: noReview,
        }),
      ],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      inProgressEvent({ threadId: 1, userStoryId: 0 }),
      doneEvent({ threadId: 1, userStoryId: 0 }),
      inProgressEvent({ threadId: 0, userStoryId: 1 }),
      doneEvent({ threadId: 0, userStoryId: 1 }),
    ]);
  });

  test('Should reset previous in progress user story when a thread chose an other user story', () => {
    const team = parallelTeam([createThread({ id: 0, power: 1 })], 0);
    const backlog = createBacklog({
      userStoriesRemaining: [
        inProgress({
          id: 0,
          threadId: 0,
          priority: 1,
          progression: 1,
        }),
        todo({
          id: 1,
          priority: 2,
        }),
      ],
    });
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      todoEvent({ threadId: 0, userStoryId: 0 }),
      inProgressEvent({ threadId: 0, userStoryId: 1 }),
      doneEvent({ threadId: 0, userStoryId: 1 }),
    ]);
    expect(backlog.userStoriesRemaining).toEqual([
      todo({ id: 0, threadId: 0, priority: 1, progression: 1 }),
    ]);
  });
});
