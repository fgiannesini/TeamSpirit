import { createUserStory } from './render-user-story.ts';

export const getThreads = (): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>('#threads');

export const getThread = (index: number): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`#thread${index}`);

export const getThreadTitle = (index: number): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`#thread-title-${index}`);

export const getThreadState = (index: number): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`#thread-state-${index}`);

export const getThreadUserStory = (index: number): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`#thread-user-story-${index}`);

export const getBacklog = (): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>('#backlog');

export const getDone = (): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>('#done');

export const getUserStory = (userStoryId: string): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`#${userStoryId}`);

export const getOrCreateUserStory = (userStoryId: string): HTMLDivElement =>
  getUserStory(userStoryId) ?? createUserStory(userStoryId);

export const getDuplicatedUserStories = (
  userStoryId: string,
): HTMLDivElement[] =>
  Array.from(
    document.querySelectorAll<HTMLDivElement>(`[id^="${userStoryId}_"]`),
  );

export const getCompute = (): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>('#compute');

export const getComputeAll = (): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>('#compute-all');
