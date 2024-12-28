const querySelector = <T extends Element>(selector: string): T => {
  let element = document.querySelector<T>(selector);
  if (!element)
    throw new Error(`element avec sélecteur ${selector} non trouvé`);
  return element;
};

export const getThreads = (): HTMLDivElement =>
  querySelector<HTMLDivElement>('#threads');

export const getThread = (index: number): HTMLDivElement =>
  querySelector<HTMLDivElement>(`#thread${index}`);

export const getBacklog = (): HTMLDivElement =>
  querySelector<HTMLDivElement>('#backlog');

export const getDone = (): HTMLDivElement =>
  querySelector<HTMLDivElement>('#done');

export const getBody = (): Element => querySelector<Element>('body');

export const getUserStory = (userStoryName: string): HTMLDivElement =>
  querySelector<HTMLDivElement>(`#${userStoryName}`);

export const getCompute = (): HTMLButtonElement =>
  querySelector<HTMLButtonElement>('#compute');
