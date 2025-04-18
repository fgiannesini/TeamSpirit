import { describe, expect, test } from 'vitest';
import {
  Backlog,
  getUserStoriesDone,
  getUserStoriesRemainings,
} from './backlog.ts';
import {
  doneEvent,
  idleEvent,
  inProgressEvent,
  reviewEvent,
  toReview,
  toReviewEvent,
  todo,
} from './factory.ts';
import { simulateTimeEvents } from './simulation-time.ts';
import { ParallelTeam } from './team.ts';

describe('simulation time', () => {
  test('should have a thread idle', () => {
    const team = new ParallelTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([idleEvent()]);
  });

  test('should have two threads idle', () => {
    const team = new ParallelTeam([
      { id: 0, name: 'thread0', power: 1 },
      { id: 1, name: 'thread1', power: 1 },
    ]);
    const backlog = new Backlog([]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      idleEvent({ threadId: 0 }),
      idleEvent({ threadId: 1 }),
    ]);
  });

  test('should have a thread develop and done a user story', () => {
    const team = new ParallelTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([todo()]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([inProgressEvent(), doneEvent()]);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('should have a thread develop a user story', () => {
    const team = new ParallelTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([todo({ complexity: 3 })]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([inProgressEvent()]);
    expect(getUserStoriesDone(backlog)).toHaveLength(0);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(1);
  });

  test('should have an efficient thread develop a complex user story', () => {
    const team = new ParallelTeam([{ id: 0, name: 'thread0', power: 3 }]);
    const backlog = new Backlog([todo({ complexity: 3 })]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([inProgressEvent(), doneEvent()]);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should have a thread develop a user story with review', () => {
    const team = new ParallelTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([
      todo({ review: { reviewersNeeded: 1, reviewers: new Map() } }),
    ]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([inProgressEvent(), toReviewEvent()]);
    expect(getUserStoriesDone(backlog)).toHaveLength(0);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(1);
  });

  test('Should have an experimented thread develop a complex user story with review', () => {
    const team = new ParallelTeam([{ id: 0, name: 'thread0', power: 3 }]);
    const backlog = new Backlog([
      todo({
        complexity: 3,
        review: { reviewersNeeded: 1, reviewers: new Map() },
      }),
    ]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([inProgressEvent(), toReviewEvent()]);
    expect(getUserStoriesDone(backlog)).toHaveLength(0);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(1);
  });

  test('Should have a thread review a user story', () => {
    const team = new ParallelTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([
      toReview({
        threadId: 1,
        review: { reviewersNeeded: 1, reviewers: new Map() },
      }),
    ]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([reviewEvent(), doneEvent({ threadId: 1 })]);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should have a thread review a complex user story', () => {
    const team = new ParallelTeam([{ id: 0, name: 'thread0', power: 1 }]);
    const backlog = new Backlog([
      toReview({
        threadId: 1,
        reviewComplexity: 2,
        review: { reviewersNeeded: 1, reviewers: new Map() },
      }),
    ]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([reviewEvent()]);
    expect(getUserStoriesDone(backlog)).toHaveLength(0);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(1);
  });
  test('Should have an experimented thread review a simple user story', () => {
    const team = new ParallelTeam([{ id: 0, name: 'thread0', power: 3 }]);
    const backlog = new Backlog([
      toReview({
        threadId: 1,
        reviewComplexity: 1,
        review: { reviewersNeeded: 1, reviewers: new Map() },
      }),
    ]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([reviewEvent(), doneEvent({ threadId: 1 })]);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should have a thread review a partially reviewed user story', () => {
    const team = new ParallelTeam([{ id: 0, name: 'thread0', power: 3 }]);
    const backlog = new Backlog([
      toReview({
        threadId: 1,
        reviewComplexity: 1,
        review: { reviewersNeeded: 2, reviewers: new Map([[2, 1]]) },
      }),
    ]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([reviewEvent(), doneEvent({ threadId: 1 })]);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should have two threads review a user story', () => {
    const team = new ParallelTeam([
      { id: 0, name: 'thread0', power: 1 },
      { id: 1, name: 'thread1', power: 1 },
    ]);
    const backlog = new Backlog([
      toReview({
        threadId: 2,
        reviewComplexity: 1,
        review: { reviewersNeeded: 2, reviewers: new Map() },
      }),
    ]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      reviewEvent({ threadId: 0 }),
      reviewEvent({ threadId: 1 }),
      doneEvent({ threadId: 2 }),
    ]);
    expect(getUserStoriesDone(backlog)).toHaveLength(1);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
  });

  test('Should have two threads review partially a user story', () => {
    const team = new ParallelTeam([
      { id: 0, name: 'thread0', power: 3 },
      { id: 1, name: 'thread1', power: 1 },
    ]);
    const backlog = new Backlog([
      toReview({
        threadId: 2,
        reviewComplexity: 3,
        review: { reviewersNeeded: 2, reviewers: new Map() },
      }),
    ]);
    const timeEvents = simulateTimeEvents(team, backlog, 1);
    expect(timeEvents).toEqual([
      reviewEvent({ threadId: 0 }),
      reviewEvent({ threadId: 1 }),
    ]);
    expect(getUserStoriesDone(backlog)).toHaveLength(0);
    expect(getUserStoriesRemainings(backlog)).toHaveLength(1);
  });
});
