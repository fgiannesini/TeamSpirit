import { describe, expect, test } from 'vitest';
import { State } from '../../simulate/user-story.ts';
import { loadTimeEvents, saveTimeEvents } from './session-storage.ts';

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
      'e4567-e89b-12d3-a456-426614174000',
    );
    expect(loadTimeEvents('e4567-e89b-12d3-a456-426614174000')).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
    ]);
  });
});
