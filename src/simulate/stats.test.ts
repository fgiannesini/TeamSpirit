import { describe, expect, test } from 'vitest';
import { computeStatEvents } from './stats.ts';
import { State } from './user-story.ts';

describe('stats', () => {
  test('should compute a long lead time on one task by one dev', () => {
    expect(
      computeStatEvents([
        {
          time: 1,
          userStoryName: 'userStory1',
          threadId: 0,
          state: State.InProgress,
        },
        {
          time: 2,
          userStoryName: 'userStory1',
          threadId: 0,
          state: State.InProgress,
        },
        {
          time: 2,
          userStoryName: 'userStory1',
          threadId: 0,
          state: State.Done,
        },
      ]),
    ).toEqual([
      { time: 1, leadTime: Number.NaN },
      { time: 2, leadTime: 2 },
    ]);
  });

  test('should compute a lead time on two tasks by two devs', () => {
    expect(
      computeStatEvents([
        {
          time: 1,
          userStoryName: 'userStory1',
          threadId: 0,
          state: State.InProgress,
        },
        {
          time: 1,
          userStoryName: 'userStory1',
          threadId: 0,
          state: State.Done,
        },
        {
          time: 1,
          userStoryName: 'userStory2',
          threadId: 1,
          state: State.InProgress,
        },
        {
          time: 1,
          userStoryName: 'userStory2',
          threadId: 1,
          state: State.Done,
        },
      ]),
    ).toEqual([{ time: 1, leadTime: 1 }]);
  });

  test('should compute a lead time on two tasks reviewed by two devs', () => {
    expect(
      computeStatEvents([
        { time: 1, userStoryName: 'US1', threadId: 0, state: State.InProgress },
        { time: 1, userStoryName: 'US0', threadId: 1, state: State.InProgress },
        { time: 1, userStoryName: 'US0', threadId: 1, state: State.ToReview },
        { time: 2, userStoryName: 'US1', threadId: 0, state: State.InProgress },
        { time: 2, userStoryName: 'US1', threadId: 0, state: State.ToReview },
        { time: 2, userStoryName: 'idle', threadId: 1, state: State.Done },
        { time: 3, userStoryName: 'US0', threadId: 0, state: State.Review },
        { time: 3, userStoryName: 'US0', threadId: 1, state: State.Done },
        { time: 3, userStoryName: 'US1', threadId: 1, state: State.Review },
        { time: 3, userStoryName: 'US1', threadId: 0, state: State.Done },
      ]),
    ).toEqual([
      { time: 1, leadTime: Number.NaN },
      { time: 2, leadTime: Number.NaN },
      { time: 3, leadTime: 3 },
    ]);
  });
});
