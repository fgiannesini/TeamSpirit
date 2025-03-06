import './style.scss';
import { Team } from './compute/team.ts';
import { Backlog } from './compute/backlog.ts';
import { State } from './compute/user-story.ts';
import { saveStatEvents, saveTimeEvents } from './flow/session-storage.ts';
import { computeStatEvents } from './compute/stats.ts';
import { generateDevForm, generateUserStoriesForm } from './compute/form.ts';

const getInputValueOf = (selector: string) => {
  const number = parseInt(
    document.querySelector<HTMLInputElement>(selector)?.value ?? '0',
  );
  return isNaN(number) ? 0 : number;
};

export const buildBacklog = () => {
  const userStoryCount = getInputValueOf('#user-story-count-input');
  const reviewersCount = getInputValueOf('#reviewers-input');
  const backlogBuilder = Backlog.init();

  Array.from({ length: userStoryCount }, (_, i) =>
    backlogBuilder.addUserStory({
      name: `US${i}`,
      complexity: getInputValueOf(`#complexity-input-${i}`),
      review: {
        reviewersNeeded: reviewersCount,
        reviewers: new Map<number, number>(),
      },
      reviewComplexity: getInputValueOf(`#review-complexity-input-${i}`),
      state: State.TODO,
      thread: undefined,
      progression: 0,
    }),
  );
  return backlogBuilder.build();
};

export const buildParallelTeam = () => {
  const teamBuilder = Team.parallelTeam();
  const devCount = getInputValueOf('#dev-count-input');
  Array.from({ length: devCount }, (_, i) => {
    return { id: i, power: getInputValueOf(`#power-input-${i}`) };
  }).forEach((thread) => teamBuilder.withDev(thread));
  return teamBuilder.build();
};

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelector<HTMLButtonElement>('#calculate-button')
    ?.addEventListener('click', () => {
      const backlog = buildBacklog();
      const team = buildParallelTeam();
      const timeEvents = team.run(backlog);
      saveTimeEvents(timeEvents);
      const statEvents = computeStatEvents(timeEvents);
      saveStatEvents(statEvents);
      window.location.href = '/TeamSpirit/flow/flow.html';
    });

  document
    .querySelector<HTMLButtonElement>('#generate-devs-button')
    ?.addEventListener('click', () => {
      const devsContainer = document.getElementById('devs-container');
      const devCount = getInputValueOf('#dev-count-input');
      const devs = Array.from({ length: devCount }, (_, i) =>
        generateDevForm(i),
      );
      devsContainer?.replaceChildren(...devs);
    });

  document
    .querySelector<HTMLButtonElement>('#generate-user-stories-button')
    ?.addEventListener('click', () => {
      const userStoriesContainer = document.getElementById(
        'user-stories-container',
      );
      const userStoriesCount = getInputValueOf('#user-story-count-input');
      const userStories = Array.from({ length: userStoriesCount }, (_, i) =>
        generateUserStoriesForm(i),
      );
      userStoriesContainer?.replaceChildren(...userStories);
    });
});
