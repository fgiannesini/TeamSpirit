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

  test('Should render the page with two events on one user story in progress and done', async () => {
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
    expect(userStoryClassNames('userStory1')).toEqual([
      'vertical',
      'horizontal-top',
      'vertical',
    ]);
  });

  test('Should render the page with two user stories', async () => {
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

    const userStoriesTitle = Array.from(
      document.querySelectorAll('.user-story span'),
    ).map((div) => div.textContent);
    expect(userStoriesTitle).toEqual(['userStory1', 'userStory2']);
  });

  test('Should render the page with two user stories in progress and done at different time', async () => {
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
          time: 2,
          userStoryName: 'userStory2',
          thread: 0,
          state: State.IN_PROGRESS,
        },
        {
          time: 2,
          userStoryName: 'userStory2',
          thread: 0,
          state: State.DONE,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    expect(userStoryClassNames('userStory1')).toEqual([
      'vertical',
      'horizontal-top',
      'vertical',
      'horizontal-bottom',
    ]);
    expect(userStoryClassNames('userStory2')).toEqual([
      'horizontal-bottom',
      'vertical',
      'horizontal-top',
      'vertical',
    ]);
  });

  test('Should render the page with one user story in progress and to review', async () => {
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
          state: State.TO_REVIEW,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    expect(userStoryClassNames('userStory1')).toEqual([
      'vertical',
      'horizontal-top',
      'vertical',
    ]);
  });

  test.each([State.IN_PROGRESS, State.REVIEW])(
    'Should render the page with one user story still processed',
    async (state: State) => {
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryName: 'userStory1',
            thread: 0,
            state: state,
          },
          {
            time: 2,
            userStoryName: 'userStory1',
            thread: 0,
            state: state,
          },
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./time-sequence.ts');

      expect(userStoryClassNames('userStory1')).toEqual([
        'vertical',
        'horizontal-top',
        'horizontal-top',
        'vertical',
      ]);
    },
  );

  test('Should render the page with one user story to review and reviewed', async () => {
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
          state: State.TO_REVIEW,
        },
        {
          time: 2,
          userStoryName: 'userStory1',
          thread: 0,
          state: State.REVIEW,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    expect(userStoryClassNames('userStory1')).toEqual([
      'vertical',
      'horizontal-top',
      'horizontal-top',
      'vertical',
    ]);
  });

  test('Should render the page with one user story reviewed by two threads', async () => {
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryName: 'userStory1',
          thread: 0,
          state: State.REVIEW,
        },
        {
          time: 1,
          userStoryName: 'userStory1',
          thread: 1,
          state: State.REVIEW,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    expect(userStoryClassNames('userStory1')).toEqual([
      'vertical',
      'horizontal-top',
      'vertical',
    ]);
  });

  const userStoryClassNames = (userStoryName: string) =>
    Array.from(document.querySelectorAll(`#${userStoryName} div`)).map(
      (div) => div.className,
    );
});
