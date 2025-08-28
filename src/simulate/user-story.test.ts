import { describe, expect, test } from 'vitest';
import {
  createThread,
  done,
  inProgress,
  inReview,
  todo,
  toReview,
} from './factory.ts';
import {
  isDeveloped,
  isInProgressBy,
  isInReviewBy,
  isReviewed,
  isToDo,
  isToReviewBy,
  needReviewBy,
  setDone,
  setDoneBy,
  setInProgress,
  setReview,
  setTodo,
  setToReview,
} from './user-story.ts';

describe('user-story', () => {
  test('should set in Progress', () => {
    const result = setInProgress(
      todo({ complexity: 3, progression: 0 }),
      createThread({ id: 0 }),
    );
    expect(result).toEqual(
      inProgress({ complexity: 3, progression: 1, threadId: 0 }),
    );
  });

  test('should set in Progress with by an experimented thread', () => {
    const result = setInProgress(
      todo({ complexity: 1, progression: 0 }),
      createThread({ id: 0, power: 3 }),
    );
    expect(result).toEqual(
      inProgress({ complexity: 1, progression: 1, threadId: 0 }),
    );
  });

  test('Should set Done', () => {
    const result = setDone(inProgress(), 1);
    expect(result).toEqual(done());
  });

  test('Should set Done By a specific thread', () => {
    const result = setDoneBy(inProgress(), 1, 1);
    expect(result).toEqual(done({ threadId: 1 }));
  });

  test('Should set toReview', () => {
    const result = setToReview(
      inProgress({
        review: {
          reviewComplexity: 1,
          reviewers: new Map(),
        },
      }),
      1,
    );
    expect(result).toEqual(toReview({ threadId: 1 }));
  });

  test('Should set review', () => {
    const result = setReview(
      toReview({
        review: {
          reviewComplexity: 1,
          reviewers: new Map(),
        },
      }),
      createThread({ power: 1 }),
    );
    expect(result).toEqual(
      inReview({
        review: {
          reviewComplexity: 1,
          reviewers: new Map([[0, 1]]),
        },
      }),
    );
  });

  test('Should keep review by an experimented thread', () => {
    const result = setReview(
      inReview({
        review: {
          reviewComplexity: 1,
          reviewers: new Map([[1, 1]]),
        },
      }),
      createThread({ power: 3 }),
    );
    expect(result).toEqual(
      inReview({
        review: {
          reviewComplexity: 1,
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
        review: {
          reviewComplexity: 2,
          reviewers: new Map([
            [0, 2],
            [1, 2],
          ]),
        },
      }),
      2,
    );
    expect(result).toEqual(true);
  });

  test('Should consider a user story not reviewed if a viewer is missing', () => {
    const result = isReviewed(
      inReview({
        review: {
          reviewComplexity: 2,
          reviewers: new Map([[0, 2]]),
        },
      }),
      2,
    );
    expect(result).toEqual(false);
  });

  test('Should consider a user story not reviewed if review is not completed', () => {
    const result = isReviewed(
      inReview({
        review: {
          reviewComplexity: 2,
          reviewers: new Map([
            [0, 1],
            [1, 2],
          ]),
        },
      }),
      2,
    );
    expect(result).toEqual(false);
  });

  test('Should consider a user story not reviewed if review is not completed', () => {
    const result = isReviewed(
      inReview({
        review: {
          reviewComplexity: 2,
          reviewers: new Map([
            [0, 1],
            [1, 2],
          ]),
        },
      }),
      2,
    );
    expect(result).toEqual(false);
  });

  test('Should consider a user story reviewed if there are too much reviews', () => {
    const result = isReviewed(
      inReview({
        review: {
          reviewComplexity: 2,
          reviewers: new Map([
            [0, 1],
            [1, 2],
          ]),
        },
      }),
      1,
    );
    expect(result).toEqual(true);
  });

  test('Should be in progress by a thread', () => {
    const result = isInProgressBy(
      inProgress({ threadId: 0 }),
      createThread({ id: 0 }),
    );
    expect(result).toEqual(true);
  });

  test('Should not be in progress', () => {
    const result = isInProgressBy(
      inReview({ threadId: 0 }),
      createThread({ id: 0 }),
    );
    expect(result).toEqual(false);
  });

  test('Should not be in progress by a thread', () => {
    const result = isInProgressBy(
      inProgress({ threadId: 1 }),
      createThread({ id: 0 }),
    );
    expect(result).toEqual(false);
  });

  test('Should consider a user story todo', () => {
    const result = isToDo(todo());
    expect(result).toEqual(true);
  });

  test('Should consider a user story not todo', () => {
    const result = isToDo(inProgress());
    expect(result).toEqual(false);
  });

  test('Should be to review by a thread', () => {
    const result = isToReviewBy(
      toReview({ threadId: 0 }),
      createThread({ id: 1 }),
    );
    expect(result).toEqual(true);
  });

  test('Should not be to review', () => {
    const result = isToReviewBy(
      inReview({ threadId: 0 }),
      createThread({ id: 1 }),
    );
    expect(result).toEqual(false);
  });

  test('Should not be to review by a thread', () => {
    const result = isToReviewBy(
      toReview({ threadId: 1 }),
      createThread({ id: 1 }),
    );
    expect(result).toEqual(false);
  });

  test('Should be reviewed by a thread', () => {
    const result = isInReviewBy(
      inReview({
        review: {
          reviewComplexity: 2,
          reviewers: new Map([
            [1, 2],
            [2, 1],
          ]),
        },
      }),
      createThread({ id: 2 }),
    );
    expect(result).toEqual(true);
  });

  test('Should not be reviewed by a thread if review is completed', () => {
    const result = isInReviewBy(
      inReview({
        review: {
          reviewComplexity: 2,
          reviewers: new Map([[2, 2]]),
        },
      }),
      createThread({ id: 2 }),
    );
    expect(result).toEqual(false);
  });

  test('Should not be reviewed by a thread if all reviews are started', () => {
    const result = isInReviewBy(
      inReview({
        review: {
          reviewComplexity: 2,
          reviewers: new Map([
            [1, 2],
            [2, 1],
          ]),
        },
      }),
      createThread({ id: 3 }),
    );
    expect(result).toEqual(false);
  });

  test('Should not be reviewed by the thread that developed the user story', () => {
    const result = isInReviewBy(
      inReview({
        review: {
          reviewComplexity: 2,
          reviewers: new Map([[1, 2]]),
        },
      }),
      createThread({ id: 0 }),
    );
    expect(result).toEqual(false);
  });

  test('Should be reviewed by an other thread', () => {
    const result = needReviewBy(
      inReview({
        review: {
          reviewComplexity: 2,
          reviewers: new Map([[1, 2]]),
        },
      }),
      createThread({ id: 2 }),
      2,
    );
    expect(result).toEqual(true);
  });

  test('Should not be reviewed by an other thread if too much reviews', () => {
    const result = needReviewBy(
      inReview({
        review: {
          reviewComplexity: 2,
          reviewers: new Map([
            [1, 2],
            [3, 2],
          ]),
        },
      }),
      createThread({ id: 2 }),
      1,
    );
    expect(result).toEqual(false);
  });

  test('Should continue review', () => {
    const result = isInReviewBy(
      inReview({
        review: {
          reviewComplexity: 2,
          reviewers: new Map([[2, 1]]),
        },
      }),
      createThread({ id: 2 }),
    );
    expect(result).toEqual(true);
  });

  test('Should set todo', () => {
    const result = setTodo(inProgress());
    expect(result).toEqual(todo({ progression: 1, threadId: 0 }));
  });
});
