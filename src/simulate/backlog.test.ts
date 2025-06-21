import { describe, expect, test, vitest } from 'vitest';
import {
  Backlog,
  getNextUserStory,
  shouldGenerateBug,
  userStoriesWithSomeReviews,
} from './backlog.ts';
import {
  done,
  ensembleTeam,
  inProgress,
  inReview,
  todo,
  toReview,
} from './factory.ts';
import type { Thread } from './team.ts';
import { idle, type UserStory } from './user-story.ts';

describe('Backlog', () => {
  test('Should get idle by default', () => {
    const backlog = new Backlog([]);
    const userStory = getNextUserStory(backlog, createThread(0));
    expect(userStory).toEqual(idle);
  });

  test('Should get best TODO', () => {
    const backlog = new Backlog([
      inProgress({ threadId: 1 }),
      todo({ complexity: 5 }),
      todo({ complexity: 1 }),
    ]);
    const userStory = getNextUserStory(backlog, createThread(0, 2));
    expect(userStory).toEqual(todo({ complexity: 1 }));
  });

  test('Should get IN_PROGRESS by the corresponding createThread', () => {
    const backlog = new Backlog([
      todo(),
      inProgress({ threadId: 0 }),
      inProgress({ threadId: 1 }),
    ]);
    const userStory = getNextUserStory(backlog, createThread(1));
    expect(userStory).toEqual(inProgress({ threadId: 1 }));
  });

  test('Should get best TO_REVIEW', () => {
    const backlog = new Backlog([
      todo(),
      toReview({
        threadId: 1,
        reviewComplexity: 5,
      }),
      toReview({ threadId: 1, reviewComplexity: 1 }),
    ]);
    const userStory = getNextUserStory(backlog, createThread(0, 2));
    expect(userStory).toEqual(toReview({ threadId: 1, reviewComplexity: 1 }));
  });

  test('Should get first IN_REVIEW', () => {
    const backlog = new Backlog([
      todo(),
      toReview({ threadId: 1, reviewComplexity: 1 }),
      inReviewWith(1, []),
    ]);
    const userStory = getNextUserStory(backlog, createThread(0));
    expect(userStory).toEqual(inReviewWith(1, []));
  });

  test('Should get first IN_PROGRESS', () => {
    const backlog = new Backlog([
      todo(),
      toReview({ threadId: 1, reviewComplexity: 1 }),
      inReviewWith(1, []),
      inProgress({ threadId: 0 }),
    ]);
    const userStory = getNextUserStory(backlog, createThread(0));
    expect(userStory).toEqual(inProgress({ threadId: 0 }));
  });

  test('Should get IN_REVIEW with a missing review', () => {
    const backlog = new Backlog([inReviewWith(1, [[0, 2]])]);
    const userStory = getNextUserStory(backlog, createThread(2));
    expect(userStory).toEqual(inReviewWith(1, [[0, 2]]));
  });

  test('Should get IN_REVIEW with a running review', () => {
    const backlog = new Backlog([
      inReviewWith(1, []),
      inReviewWith(1, [
        [0, 1],
        [2, 2],
      ]),
    ]);
    const userStory = getNextUserStory(backlog, createThread(0));
    expect(userStory).toEqual(
      inReviewWith(1, [
        [0, 1],
        [2, 2],
      ]),
    );
  });

  test('Should not get IN_REVIEW when review is done', () => {
    const backlog = new Backlog([inReviewWith(1, [[0, 2]])]);
    const userStory = getNextUserStory(backlog, createThread(0));
    expect(userStory).toEqual(idle);
  });

  test('Should not get completed IN_REVIEW by a reviewer', () => {
    const backlog = new Backlog([
      inReviewWith(1, [
        [0, 2],
        [2, 2],
      ]),
    ]);
    const userStory = getNextUserStory(backlog, createThread(0));
    expect(userStory).toEqual(idle);
  });

  test('Should not get completed IN_REVIEW by an other dev', () => {
    const backlog = new Backlog([
      inReviewWith(1, [
        [0, 2],
        [2, 2],
      ]),
    ]);
    const userStory = getNextUserStory(backlog, createThread(3));
    expect(userStory).toEqual(idle);
  });

  test('Should not get self IN_REVIEW', () => {
    const backlog = new Backlog([inReviewWith(1, [])]);
    const userStory = getNextUserStory(backlog, createThread(1));
    expect(userStory).toEqual(idle);
  });

  test('Should get userStories with ended partial review', () => {
    const backlog = new Backlog([
      todo({ complexity: 0 }),
      inProgress({ threadId: 0 }),
      toReview({ threadId: 0, reviewComplexity: 1 }),
      inReviewWith(0, [[0, 1]]),
      inReviewWith(0, [[0, 2]]),
      inReviewWith(0, [
        [0, 2],
        [1, 1],
      ]),
      inReviewWith(0, [
        [0, 2],
        [1, 2],
      ]),
    ]);
    const userStory = userStoriesWithSomeReviews(backlog);
    expect(userStory).toEqual([inReviewWith(0, [[0, 2]])]);
  });

  const inReviewWith = (
    threadId: number,
    reviewers: [number, number][],
  ): UserStory => {
    return inReview({
      threadId,
      reviewComplexity: 2,
      review: { reviewersNeeded: 2, reviewers: new Map(reviewers) },
    });
  };

  const createThread = (id: number, power = 1): Thread => {
    return { id, name: '', power };
  };

  test('should generate a bug', () => {
    const randomProvider = vitest
      .fn()
      .mockReturnValueOnce(0)
      .mockReturnValue(1);
    expect(
      shouldGenerateBug(randomProvider, done(), ensembleTeam(), 0),
    ).toEqual(true);
  });

  test('should not generate a bug', () => {
    const randomProvider = vitest.fn().mockReturnValue(1);
    expect(
      shouldGenerateBug(randomProvider, done(), ensembleTeam(), 0),
    ).toEqual(false);
  });
});
