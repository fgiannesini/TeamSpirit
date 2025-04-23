import { createUserStory } from './render-user-story.ts';

export const getThreads = (): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>('#threads');

export const getThread = (index: number): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`#thread${index}`);

export const getThreadTitle = (index: number): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`#thread-title-${index}`);

export const getThreadState = (threadId: number): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`#thread-state-${threadId}`);

export const getThreadUserStoryContainer = (
  threadId: number,
): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`#thread-user-story-${threadId}`);

export const getBacklog = (): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>('#backlog');

export const getDone = (): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>('#done');

export const getUserStory = (userStoryId: number): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`[id^="user-story-${userStoryId}"]`);

export const getAllUserStories = (userStoryId: number): HTMLDivElement[] =>
  Array.from(document.querySelectorAll(`[id^="user-story-${userStoryId}"]`));

export const getUserStoryOfThread = (
  userStoryId: number,
  threadId: number,
): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(
    `#user-story-${userStoryId}-${threadId}`,
  );

export const getOrCreateUserStory = (userStoryId: number): HTMLDivElement =>
  getUserStory(userStoryId) ?? createUserStory(userStoryId, '');

export const getDuplicatedUserStories = (
  userStoryId: number,
): HTMLDivElement[] =>
  Array.from(
    document.querySelectorAll<HTMLDivElement>(
      `[id^="user-story-${userStoryId}-"]`,
    ),
  );

export const getCompute = (): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>('#compute');

export const getComputeAll = (): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>('#compute-all');
