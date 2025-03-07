import { describe, expect, test } from 'vitest';
import { loadTimeEvents, saveTimeEvents } from './session-storage.ts';
import { State } from '../../simulate/user-story.ts';

describe('session storage', () => {
  test('should save and load time events', () => {
    saveTimeEvents([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
    ]);
    expect(loadTimeEvents()).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
    ]);
  });
});
