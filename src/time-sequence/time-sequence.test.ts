import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { saveStructureEvents, saveTimeEvents } from '../flow/storage/session-storage.ts';
import type { StructureEvent } from '../simulate/simulation-structure.ts';
import type { State } from '../simulate/user-story.ts';

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
          state: 'InProgress',
        },
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: 'Done',
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
      [
        createUserStory({ id: 0, name: 'US0' }),
        createUserStory({ id: 1, name: 'US1' }),
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    saveTimeEvents(
      [
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: 'InProgress',
        },
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: 'Done',
        },
        {
          time: 1,
          userStoryId: 1,
          threadId: 1,
          state: 'InProgress',
        },
        {
          time: 1,
          userStoryId: 1,
          threadId: 1,
          state: 'Done',
        },
        {
          time: 1,
          userStoryId: -1,
          threadId: 2,
          state: 'Done',
        },
      ],
      'e4567-e89b-12d3-a456-426614174000',
    );
    await import('./time-sequence.ts');

    const userStoriesTitle = Array.from(
      document.querySelectorAll('.user-story span'),
    ).map((div) => div.textContent);
    expect(userStoriesTitle).toEqual(['US0', 'US1']);
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
          state: 'InProgress',
        },
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: 'Done',
        },
        {
          time: 2,
          userStoryId: 1,
          threadId: 0,
          state: 'InProgress',
        },
        {
          time: 2,
          userStoryId: 1,
          threadId: 0,
          state: 'Done',
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
          state: 'InProgress',
        },
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: 'ToReview',
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

  test.each(['InProgress' as State, 'Review' as State])(
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
            state,
          },
          {
            time: 2,
            userStoryId: 0,
            threadId: 0,
            state,
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
          state: 'InProgress',
        },
        {
          time: 1,
          userStoryId: 0,
          threadId: 0,
          state: 'ToReview',
        },
        {
          time: 2,
          userStoryId: 0,
          threadId: 0,
          state: 'Review',
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
          state: 'Review',
        },
        {
          time: 1,
          userStoryId: 0,
          threadId: 1,
          state: 'Review',
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
          state: 'InProgress',
        },
        {
          time: 1,
          userStoryId: 1,
          threadId: 1,
          state: 'InProgress',
        },
        {
          time: 1,
          userStoryId: 1,
          threadId: 1,
          state: 'Done',
        },
        {
          time: 2,
          userStoryId: 0,
          threadId: 0,
          state: 'InProgress',
        },
        {
          time: 3,
          userStoryId: 0,
          threadId: 0,
          state: 'InProgress',
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

  const userStoryClassNames = (userStoryId: string): string[] =>
    Array.from(document.querySelectorAll(`#${userStoryId} div`)).map(
      (div) => div.className,
    );
});
