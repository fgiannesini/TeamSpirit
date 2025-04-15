import {describe, expect, test} from 'vitest';
import {Backlog, getNextUserStory, shouldGenerateBug, userStoriesWithSomeReviews,} from './backlog.ts';
import {noReview} from './review.ts';
import type {Thread} from './team.ts';
import {idle, State, type UserStory} from './user-story.ts';
import {inProgress, todo} from "./factory.ts";

describe('Backlog', () => {
  test('Should get idle by default', () => {
    const backlog = new Backlog([]);
    const userStory = getNextUserStory(backlog, thread(0));
    expect(userStory).toEqual(idle);
  });

  test('Should get best TODO', () => {
    const backlog = new Backlog([inProgress({threadId: 1}), todo({complexity: 5}), todo({complexity: 1})]);
    const userStory = getNextUserStory(backlog, thread(0, 2));
    expect(userStory).toEqual(todo({complexity: 1}));
  });

  test('Should get IN_PROGRESS by the corresponding thread', () => {
    const backlog = new Backlog([todo({complexity: 1}), inProgress({threadId: 0}), inProgress({threadId: 1})]);
    const userStory = getNextUserStory(backlog, thread(1));
    expect(userStory).toEqual(inProgress({threadId: 1}));
  });

  test('Should get best TO_REVIEW', () => {
    const backlog = new Backlog([todo({complexity: 1}), toReview(1, 5), toReview(1, 1)]);
    const userStory = getNextUserStory(backlog, thread(0, 2));
    expect(userStory).toEqual(toReview(1));
  });

  test('Should get first IN_REVIEW', () => {
    const backlog = new Backlog([todo({complexity: 1}), toReview(1), inReview(1, [])]);
    const userStory = getNextUserStory(backlog, thread(0));
    expect(userStory).toEqual(inReview(1, []));
  });

  test('Should get first IN_PROGRESS', () => {
    const backlog = new Backlog([
      todo({complexity: 1}),
      toReview(1),
      inReview(1, []),
      inProgress({threadId: 0}),
    ]);
    const userStory = getNextUserStory(backlog, thread(0));
    expect(userStory).toEqual(inProgress({threadId: 0}));
  });

  test('Should get IN_REVIEW with a missing review', () => {
    const backlog = new Backlog([inReview(1, [[0, 2]])]);
    const userStory = getNextUserStory(backlog, thread(2));
    expect(userStory).toEqual(inReview(1, [[0, 2]]));
  });

  test('Should get IN_REVIEW with a running review', () => {
    const backlog = new Backlog([
      inReview(1, [
        [0, 1],
        [2, 2],
      ]),
    ]);
    const userStory = getNextUserStory(backlog, thread(0));
    expect(userStory).toEqual(
      inReview(1, [
        [0, 1],
        [2, 2],
      ]),
    );
  });

  test('Should not get IN_REVIEW when review is done', () => {
    const backlog = new Backlog([inReview(1, [[0, 2]])]);
    const userStory = getNextUserStory(backlog, thread(0));
    expect(userStory).toEqual(idle);
  });

  test('Should not get completed IN_REVIEW by a reviewer', () => {
    const backlog = new Backlog([
      inReview(1, [
        [0, 2],
        [2, 2],
      ]),
    ]);
    const userStory = getNextUserStory(backlog, thread(0));
    expect(userStory).toEqual(idle);
  });

  test('Should not get completed IN_REVIEW by an other dev', () => {
    const backlog = new Backlog([
      inReview(1, [
        [0, 2],
        [2, 2],
      ]),
    ]);
    const userStory = getNextUserStory(backlog, thread(3));
    expect(userStory).toEqual(idle);
  });

  test('Should not get self IN_REVIEW', () => {
    const backlog = new Backlog([inReview(1, [])]);
    const userStory = getNextUserStory(backlog, thread(1));
    expect(userStory).toEqual(idle);
  });

  test('Should get userStories with ended partial review', () => {
    const backlog = new Backlog([
      todo({complexity: 0}),
      inProgress({threadId: 0}),
      toReview(0),
      inReview(0, [[0, 1]]),
      inReview(0, [[0, 2]]),
      inReview(0, [
        [0, 2],
        [1, 1],
      ]),
      inReview(0, [
        [0, 2],
        [1, 2],
      ]),
    ]);
    const userStory = userStoriesWithSomeReviews(backlog);
    expect(userStory).toEqual([inReview(0, [[0, 2]])]);
  });

  const inReview = (
    threadId: number,
    reviewers: [number, number][],
  ): UserStory => {
    return {
      id: 0,
      name: 'inReview',
      complexity: 4,
      reviewComplexity: 2,
      review: {
        reviewersNeeded: 2,
        reviewers: new Map(reviewers),
      },
      state: State.Review,
      threadId: threadId,
      progression: 0,
    };
  };

  const toReview = (threadId: number, reviewComplexity = 1): UserStory => {
    return {
      id: 0,
      name: 'toReview',
      complexity: 1,
      reviewComplexity,
      review: noReview,
      state: State.ToReview,
      threadId: threadId,
      progression: 0,
    };
  };

  const thread = (id: number, power = 1): Thread => {
    return { id, name: '', power };
  };

  test('should not generate a bug in the first turn', () => {
    expect(shouldGenerateBug(0)).toEqual(false);
  });

  test('should not generate a bug in the second turn', () => {
    expect(shouldGenerateBug(1, () => 0.5)).toEqual(false);
  });

  test('should generate a bug in the second turn', () => {
    expect(shouldGenerateBug(1, () => 1)).toEqual(true);
  });

  test('should generate a bug in the third turn', () => {
    expect(shouldGenerateBug(2, () => 0.5)).toEqual(true);
  });

  test('should not generate a bug in the third turn', () => {
    expect(shouldGenerateBug(2, () => 0.51)).toEqual(true);
  });

});
