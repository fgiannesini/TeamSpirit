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
          time: 2,
          userStoryName: 'userStory1',
          thread: 0,
          state: State.DONE,
        },
      ])
    ).toEqual([
      { time: 1, leadTime: 1 },
      { time: 2, leadTime: 2 },
    ]);
  });
});
