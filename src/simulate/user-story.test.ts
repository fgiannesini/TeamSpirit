import { describe, expect, test } from 'vitest';
import {
  done,
  inProgress,
  inReview,
  thread,
  toReview,
  todo,
} from './factory.ts';
import {
  isDeveloped,
  isReviewed,
  setDone,
  setDoneBy,
  setInProgress,
  setReview,
  setToReview,
} from './user-story.ts';

describe('user-story', () => {
  test('should set in Progress', () => {
    const result = setInProgress(
      todo({ complexity: 3, progression: 0 }),
      thread({ id: 0 }),
    );
    expect(result).toEqual(
      inProgress({ complexity: 3, progression: 1, threadId: 0 }),
    );
  });

  test('should set in Progress with by an experimented thread', () => {
    const result = setInProgress(
      todo({ complexity: 1, progression: 0 }),
      thread({ id: 0, power: 3 }),
    );
    expect(result).toEqual(
      inProgress({ complexity: 1, progression: 1, threadId: 0 }),
    );
  });

  test('Should set Done', () => {
    const result = setDone(inProgress());
    expect(result).toEqual(done());
  });

  test('Should set Done By a specific thread', () => {
    const result = setDoneBy(inProgress(), 1);
    expect(result).toEqual(done({ threadId: 1 }));
  });

  test('Should set toReview', () => {
    const result = setToReview(
      inProgress({ review: { reviewers: new Map(), reviewersNeeded: 1 } }),
      1,
    );
    expect(result).toEqual(toReview({ threadId: 1 }));
  });

  test('Should set review', () => {
    const result = setReview(
      toReview({
        review: { reviewersNeeded: 1, reviewers: new Map() },
        reviewComplexity: 1,
      }),
      thread({ power: 1 }),
    );
    expect(result).toEqual(
      inReview({
        review: { reviewersNeeded: 1, reviewers: new Map([[0, 1]]) },
      }),
    );
  });

  test('Should keep review by an experimented thread', () => {
    const result = setReview(
      inReview({
        review: { reviewersNeeded: 2, reviewers: new Map([[1, 1]]) },
        reviewComplexity: 1,
      }),
      thread({ power: 3 }),
    );
    expect(result).toEqual(
      inReview({
        review: {
          reviewersNeeded: 2,
          reviewers: new Map([
            [1, 1],
            [0, 1],
          ]),
        },
      }),
    );
  });

  test('Should consider a user story developed', () => {
    const result = isDeveloped(
      inProgress({
        complexity: 3,
        progression: 3,
      }),
    );
    expect(result).toEqual(true);
  });

  test('Should consider a user story not developed', () => {
    const result = isDeveloped(
      inProgress({
        complexity: 3,
        progression: 1,
      }),
    );
    expect(result).toEqual(false);
  });

  test('Should consider a user story reviewed', () => {
    const result = isReviewed(
      inReview({
        reviewComplexity: 2,
        review: {
          reviewersNeeded: 2,
          reviewers: new Map([
            [0, 2],
            [1, 2],
          ]),
        },
      }),
    );
    expect(result).toEqual(true);
  });
});
