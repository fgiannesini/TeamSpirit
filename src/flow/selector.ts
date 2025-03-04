export const getThreads = (): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>('#threads');

export const getThread = (index: number): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`#thread${index}`);

export const getBacklog = (): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>('#backlog');

export const getDone = (): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>('#done');

export const getUserStory = (userStoryName: string): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(`#${userStoryName}`);

export const getDuplicatedUserStories = (
  userStoryName: string,
): HTMLDivElement[] =>
  Array.from(
    document.querySelectorAll<HTMLDivElement>(`[id^="${userStoryName}_"]`),
  );

export const getCompute = (): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>('#compute');
