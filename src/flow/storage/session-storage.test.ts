import { describe, expect, test } from 'vitest';
import { State } from '../../simulate/user-story.ts';
import {
  loadStatEvents,
  loadStructureEvents,
  loadTimeEvents,
  saveStatEvents,
  saveStructureEvents,
  saveTimeEvents,
} from './session-storage.ts';

describe('session storage', () => {
  test('should save and load time events', () => {
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryId: 1,
          threadId: 0,
          state: State.InProgress,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    expect(loadTimeEvents('e4567-e89b-12d3-a456-426614174000')).toEqual([
      {
        time: 1,
        userStoryId: 1,
        threadId: 0,
        state: State.InProgress,
      },
    ]);
  });

  test('should save and load stats events', () => {
    saveStatEvents(
      [
        {
          time: 1,
          leadTime: 1.2,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    expect(loadStatEvents('e4567-e89b-12d3-a456-426614174000')).toEqual([
      {
        time: 1,
        leadTime: 1.2,
      },
    ]);
  });

  test('should save and load structure events', () => {
    saveStructureEvents(
      [
        {
          time: 1,
          action: 'CreateThread',
          name: '1',
          id: 1,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    expect(loadStructureEvents('e4567-e89b-12d3-a456-426614174000')).toEqual([
      {
        time: 1,
        action: 'CreateThread',
        name: '1',
        id: 1,
      },
    ]);
  });
});
