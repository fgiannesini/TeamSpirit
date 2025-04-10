import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  saveStructureEvents,
  saveTimeEvents,
} from '../flow/storage/session-storage.ts';
import type { StructureEvent } from '../simulate/simulation-structure.ts';
import { State } from '../simulate/user-story.ts';

describe('Time sequence', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      assign: vi.fn(),
      search: '?id=e4567-e89b-12d3-a456-426614174000',
    } as unknown as Location);
    const htmlPath = resolve(__dirname, './time-sequence.html');
    document.body.innerHTML = readFileSync(htmlPath, 'utf-8');
    vi.useFakeTimers();
  });

  const createUserStory = (
    options: Partial<StructureEvent>,
  ): StructureEvent => ({
    id: 0,
    name: 'user-story-0',
    action: 'CreateUserStory',
    time: 1,
    ...options,
  });

  test('Should render the page with two events on one user story in progress and done', async () => {
    saveStructureEvents(
      [createUserStory({ id: 0 })],
      'e4567-e89b-12d3-a456-426614174000',
    );
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: State.InProgress,
        },
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: State.Done,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    const userStories = document.querySelectorAll('.user-story');
    expect(userStories.length).toEqual(1);
    expect(userStoryClassNames('user-story-0')).toEqual([
      'vertical',
      'horizontal-top',
      'vertical',
    ]);
  });

  test('Should render the page with two user stories', async () => {
    saveStructureEvents(
      [createUserStory({ id: 0 }), createUserStory({ id: 1 })],
      'e4567-e89b-12d3-a456-426614174000',
    );
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: State.InProgress,
        },
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: State.Done,
        },
        {
          time: 1,
          userStoryId: 1,
          threadId: 1,
          state: State.InProgress,
        },
        {
          time: 1,
          userStoryId: 1,
          threadId: 1,
          state: State.Done,
        },
        {
          time: 1,
          userStoryId: -1,
          threadId: 2,
          state: State.Done,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    const userStoriesTitle = Array.from(
      document.querySelectorAll('.user-story span'),
    ).map((div) => div.textContent);
    expect(userStoriesTitle).toEqual(['userStory0', 'userStory1']);
  });

  test('Should render the page with two user stories in progress and done at different time', async () => {
    saveStructureEvents(
      [createUserStory({ id: 0 }), createUserStory({ id: 1 })],
      'e4567-e89b-12d3-a456-426614174000',
    );
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: State.InProgress,
        },
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: State.Done,
        },
        {
          time: 2,
          userStoryId: 1,
          threadId: 0,
          state: State.InProgress,
        },
        {
          time: 2,
          userStoryId: 1,
          threadId: 0,
          state: State.Done,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    expect(userStoryClassNames('user-story-0')).toEqual([
      'vertical',
      'horizontal-top',
      'vertical',
      'horizontal-bottom',
      'vertical-dashed',
    ]);
    expect(userStoryClassNames('user-story-1')).toEqual([
      'vertical-dashed',
      'horizontal-bottom',
      'vertical',
      'horizontal-top',
      'vertical',
    ]);
  });

  test('Should render the page with one user story in progress and to review', async () => {
    saveStructureEvents(
      [createUserStory({ id: 0 })],
      'e4567-e89b-12d3-a456-426614174000',
    );
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: State.InProgress,
        },
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: State.ToReview,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    expect(userStoryClassNames('user-story-0')).toEqual([
      'vertical',
      'horizontal-top',
      'vertical',
    ]);
  });

  test.each([State.InProgress, State.Review])(
    'Should render the page with one user story still processed',
    async (state: State) => {
      saveStructureEvents(
        [createUserStory({ id: 0 })],
        'e4567-e89b-12d3-a456-426614174000',
      );
      saveTimeEvents(
        [
          {
            time: 1,
            userStoryId: 0,
            threadId: 0,
            state: state,
          },
          {
            time: 2,
            userStoryId: 0,
            threadId: 0,
            state: state,
          },
        ],
        'e4567-e89b-12d3-a456-426614174000',
      );
      await import('./time-sequence.ts');

      expect(userStoryClassNames('user-story-0')).toEqual([
        'vertical',
        'horizontal-top',
        'vertical-dashed',
        'horizontal-top',
        'vertical',
      ]);
    },
  );

  test('Should render the page with one user story to review and reviewed', async () => {
    saveStructureEvents(
      [createUserStory({ id: 0 })],
      'e4567-e89b-12d3-a456-426614174000',
    );
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: State.InProgress,
        },
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: State.ToReview,
        },
        {
          time: 2,
          userStoryId: 0,
          threadId: 0,
          state: State.Review,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    expect(userStoryClassNames('user-story-0')).toEqual([
      'vertical',
      'horizontal-top',
      'vertical-dashed',
      'horizontal-top',
      'vertical',
    ]);
  });

  test('Should render the page with one user story reviewed by two threads', async () => {
    saveStructureEvents(
      [createUserStory({ id: 0 })],
      'e4567-e89b-12d3-a456-426614174000',
    );
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: State.Review,
        },
        {
          time: 1,
          userStoryId: 0,
          threadId: 1,
          state: State.Review,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    expect(userStoryClassNames('user-story-0')).toEqual([
      'vertical',
      'horizontal-top',
      'vertical',
    ]);
  });

  test('Should render the page with one user story reviewed by two threads', async () => {
    saveStructureEvents(
      [createUserStory({ id: 0 }), createUserStory({ id: 1 })],
      'e4567-e89b-12d3-a456-426614174000',
    );
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: State.InProgress,
        },
        {
          time: 1,
          userStoryId: 1,
          threadId: 1,
          state: State.InProgress,
        },
        {
          time: 1,
          userStoryId: 1,
          threadId: 1,
          state: State.Done,
        },
        {
          time: 2,
          userStoryId: 0,
          threadId: 0,
          state: State.InProgress,
        },
        {
          time: 3,
          userStoryId: 0,
          threadId: 0,
          state: State.InProgress,
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    expect(userStoryClassNames('user-story-1')).toEqual([
      'vertical',
      'horizontal-top',
      'vertical',
      'horizontal-bottom',
      'vertical-dashed',
      'horizontal-bottom',
      'vertical-dashed',
    ]);
  });

  const userStoryClassNames = (userStoryId: string) =>
    Array.from(document.querySelectorAll(`#${userStoryId} div`)).map(
      (div) => div.className,
    );
});
