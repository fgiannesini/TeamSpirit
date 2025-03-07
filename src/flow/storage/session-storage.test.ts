import { describe, expect, test } from 'vitest';
import { loadTimeEvents, saveTimeEvents } from './session-storage.ts';
import { State } from '../../simulate/user-story.ts';

describe('session storage', () => {
  test('should save and load time events', () => {
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryName: 'userStory1',
          thread: 0,
          state: State.IN_PROGRESS,
        },
      ],
      '123e4567-e89b-12d3-a456-426614174000',
    );
    expect(loadTimeEvents('123e4567-e89b-12d3-a456-426614174000')).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
    ]);
  });
});
