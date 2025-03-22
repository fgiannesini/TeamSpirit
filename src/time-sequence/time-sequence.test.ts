import { beforeEach, describe, expect, test, vi } from 'vitest';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { saveTimeEvents } from '../flow/storage/session-storage.ts';
import { State } from '../simulate/user-story.ts';

describe('Time sequence', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      assign: vi.fn(),
      search: '?id=e4567-e89b-12d3-a456-426614174000',
    } as unknown as Location);
    const htmlPath = resolve(__dirname, './time-sequence.html');
    document.body.innerHTML = readFileSync(htmlPath, 'utf-8');
    vi.useFakeTimers();
  });

  test('Should render the page with two events on one user story', async () => {
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryName: 'userStory1',
          thread: 0,
          state: State.IN_PROGRESS,
        },
        {
          time: 1,
          userStoryName: 'userStory1',
          thread: 0,
          state: State.DONE,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    const userStories = document.querySelectorAll('.user-story');
    expect(userStories.length).toEqual(1);
    expect(
      Array.from(document.querySelectorAll('#userStory1 div')).map(
        (div) => div.className,
      ),
    ).toEqual(['vertical', 'horizontal-top', 'vertical']);
  });

  test('Should render the page with two events on two user stories', async () => {
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryName: 'userStory1',
          thread: 0,
          state: State.IN_PROGRESS,
        },
        {
          time: 1,
          userStoryName: 'userStory1',
          thread: 0,
          state: State.DONE,
        },
        {
          time: 1,
          userStoryName: 'userStory2',
          thread: 1,
          state: State.IN_PROGRESS,
        },
        {
          time: 1,
          userStoryName: 'userStory2',
          thread: 1,
          state: State.DONE,
        },
        {
          time: 1,
          userStoryName: 'idle',
          thread: 2,
          state: State.DONE,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    const userStories = document.querySelectorAll('.user-story');
    expect(userStories.length).toEqual(2);
  });
});
