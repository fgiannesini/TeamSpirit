import { describe, expect, test } from 'vitest';
import {
  Backlog,
  getNextUserStory,
  userStoriesWithSomeReviews,
} from './backlog.ts';
import { noReview } from './review.ts';
import type { Thread } from './team.ts';
import { State, type UserStory, idle } from './user-story.ts';

describe('Backlog', () => {
  test('Should get idle by default', () => {
    const backlog = new Backlog([]);
    const userStory = getNextUserStory(backlog, thread(0));
    expect(userStory).toEqual(idle);
  });

  test('Should get best TODO', () => {
    const backlog = new Backlog([inProgress(1), todo(5), todo(1)]);
    const userStory = getNextUserStory(backlog, thread(0, 2));
    expect(userStory).toEqual(todo(1));
  });

  test('Should get IN_PROGRESS by the corresponding thread', () => {
    const backlog = new Backlog([todo(), inProgress(0), inProgress(1)]);
    const userStory = getNextUserStory(backlog, thread(1));
    expect(userStory).toEqual(inProgress(1));
  });

  test('Should get best TO_REVIEW', () => {
    const backlog = new Backlog([todo(), toReview(1, 5), toReview(1, 1)]);
    const userStory = getNextUserStory(backlog, thread(0, 2));
    expect(userStory).toEqual(toReview(1));
  });

  test('Should get first IN_REVIEW', () => {
    const backlog = new Backlog([todo(), toReview(1), inReview(1, [])]);
    const userStory = getNextUserStory(backlog, thread(0));
    expect(userStory).toEqual(inReview(1, []));
  });

  test('Should get first IN_PROGRESS', () => {
    const backlog = new Backlog([
      todo(),
      toReview(1),
      inReview(1, []),
      inProgress(0),
    ]);
    const userStory = getNextUserStory(backlog, thread(0));
    expect(userStory).toEqual(inProgress(0));
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
      todo(0),
      inProgress(0),
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

  const inProgress = (threadId: number): UserStory => {
    return {
      id: 0,
      name: 'inProgress',
      complexity: 2,
      reviewComplexity: 1,
      review: noReview,
      state: State.InProgress,
      threadId: threadId,
      progression: 0,
    };
  };

  const todo = (complexity = 1): UserStory => {
    return {
      id: 0,
      name: 'todo',
      complexity,
      reviewComplexity: 1,
      review: noReview,
      state: State.Todo,
      threadId: undefined,
      progression: 0,
    };
  };

  const thread = (id: number, power = 1): Thread => {
    return { id, name: '', power };
  };

  const shouldGenerateBug = (time: number) => {
    if (time !== 0 && time % 2 === 0) {
      return true;
    }
    return false;
  };

  test('should generate a bug', () => {
    expect(shouldGenerateBug(0)).toEqual(false);
    expect(shouldGenerateBug(1)).toEqual(false);
    expect(shouldGenerateBug(2)).toEqual(true);
    expect(shouldGenerateBug(3)).toEqual(false);
    expect(shouldGenerateBug(4)).toEqual(true);
  });
});
