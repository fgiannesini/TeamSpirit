import {
  createUserStory,
  createUserStoryInThread,
} from './render-user-story.ts';

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

export const getUserStory = (userStoryId: number): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`#user-story-${userStoryId}`);

export const getOrCreateUserStoryInThread = (
  userStoryId: number,
  threadId: number,
): HTMLDivElement => {
  return (
    document.querySelector<HTMLDivElement>(
      `#user-story-${userStoryId}_${threadId}`,
    ) ??
    getUserStory(userStoryId) ??
    createUserStoryInThread(userStoryId, threadId)
  );
};

export const getOrCreateUserStory = (userStoryId: number): HTMLDivElement =>
  getUserStory(userStoryId) ?? createUserStory(userStoryId);

export const getDuplicatedUserStories = (
  userStoryId: number,
): HTMLDivElement[] =>
  Array.from(
    document.querySelectorAll<HTMLDivElement>(
      `[id^="user-story-${userStoryId}_"]`,
    ),
  );

export const getCompute = (): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>('#compute');

export const getComputeAll = (): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>('#compute-all');
