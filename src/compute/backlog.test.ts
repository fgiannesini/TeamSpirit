import { describe, expect, test } from 'vitest';
import { Backlog } from './backlog.ts';
import { idle, State } from './user-story.ts';
import { noReview } from './review.ts';

describe('Backlog', () => {
  test('Should get idle by default', () => {
    const backlog = new Backlog([]);
    const userStory = backlog.next(thread());
    expect(userStory).toEqual(idle);
  });

  test('Should get TODO', () => {
    const backlog = new Backlog([todo()]);
    const userStory = backlog.next(thread());
    expect(userStory).toEqual(todo());
  });

  test('Should get IN_PROGRESS by the corresponding thread', () => {
    const backlog = new Backlog([todo(), inProgress(0), inProgress(1)]);
    const userStory = backlog.next(thread(1));
    expect(userStory).toEqual(inProgress(1));
  });

  test('Should get first TO_REVIEW', () => {
    const backlog = new Backlog([todo(), toReview(1), toReview(2)]);
    const userStory = backlog.next(thread(0));
    expect(userStory).toEqual(toReview(1));
  });

  test('Should get first IN_REVIEW', () => {
    const backlog = new Backlog([todo(), toReview(1), inReview(1, [])]);
    const userStory = backlog.next(thread(0));
    expect(userStory).toEqual(inReview(1, []));
  });

  test('Should get first IN_PROGRESS', () => {
    const backlog = new Backlog([
      todo(),
      toReview(1),
      inReview(1, []),
      inProgress(0),
    ]);
    const userStory = backlog.next(thread(0));
    expect(userStory).toEqual(inProgress(0));
  });

  test('Should get IN_REVIEW with a missing review', () => {
    const backlog = new Backlog([inReview(1, [[0, 2]])]);
    const userStory = backlog.next(thread(2));
    expect(userStory).toEqual(inReview(1, [[0, 2]]));
  });

  test('Should get IN_REVIEW with a running review', () => {
    const backlog = new Backlog([
      inReview(1, [
        [0, 1],
        [2, 2],
      ]),
    ]);
    const userStory = backlog.next(thread(0));
    expect(userStory).toEqual(
      inReview(1, [
        [0, 1],
        [2, 2],
      ]),
    );
  });

  test('Should not get IN_REVIEW when review is done', () => {
    const backlog = new Backlog([inReview(1, [[0, 2]])]);
    const userStory = backlog.next(thread(0));
    expect(userStory).toEqual(idle);
  });

  test('Should not get completed IN_REVIEW by a reviewer', () => {
    const backlog = new Backlog([
      inReview(1, [
        [0, 2],
        [2, 2],
      ]),
    ]);
    const userStory = backlog.next(thread(0));
    expect(userStory).toEqual(idle);
  });

  test('Should not get completed IN_REVIEW by an other dev', () => {
    const backlog = new Backlog([
      inReview(1, [
        [0, 2],
        [2, 2],
      ]),
    ]);
    const userStory = backlog.next(thread(3));
    expect(userStory).toEqual(idle);
  });

  test('Should not get self IN_REVIEW', () => {
    const backlog = new Backlog([inReview(1, [])]);
    const userStory = backlog.next(thread(1));
    expect(userStory).toEqual(idle);
  });

  const inReview = (thread: number, reviewers: [number, number][]) => {
    return {
      name: 'inReview',
      complexity: 4,
      reviewComplexity: 2,
      review: {
        reviewersNeeded: 2,
        reviewers: new Map(reviewers),
      },
      state: State.REVIEW,
      thread: thread,
      progression: 0,
    };
  };

  const toReview = (thread: number) => {
    return {
      name: 'toReview',
      complexity: 1,
      reviewComplexity: 1,
      review: noReview,
      state: State.TO_REVIEW,
      thread: thread,
      progression: 0,
    };
  };

  const inProgress = (thread: number) => {
    return {
      name: 'inProgress',
      complexity: 1,
      reviewComplexity: 1,
      review: noReview,
      state: State.IN_PROGRESS,
      thread: thread,
      progression: 0,
    };
  };

  const todo = () => {
    return {
      name: 'todo',
      complexity: 1,
      reviewComplexity: 1,
      review: noReview,
      state: State.TODO,
      thread: undefined,
      progression: 0,
    };
  };

  const thread = (id = 0) => {
    return { id, power: 1 };
  };
});
