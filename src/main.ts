import './style.scss';
import { Team } from './compute/team.ts';
import { Backlog } from './compute/backlog.ts';
import { State } from './compute/user-story.ts';
import { saveStatEvents, saveTimeEvents } from './flow/session-storage.ts';
import { computeStatEvents } from './compute/stats.ts';

const createUserStory = (i: number, reviewersCount: number) => ({
  name: `US${i}`,
  complexity: 1,
  review: {
    reviewersNeeded: reviewersCount,
    reviewers: new Map<number, number>(),
  },
  reviewComplexity: 1,
  state: State.TODO,
  thread: undefined,
  progression: 0,
});

const getInputValueOf = (selector: string) =>
  parseInt(document.querySelector<HTMLInputElement>(selector)?.value ?? '0');

export const buildBacklog = () => {
  const taskCount = getInputValueOf('#task-count-input');
  const reviewersCount = getInputValueOf('#reviewers-input');
  const backlogBuilder = Backlog.init();
  Array.from({ length: taskCount }, (_, i) =>
    backlogBuilder.addUserStory(createUserStory(i, reviewersCount)),
  );
  return backlogBuilder.build();
};

export const buildParallelTeam = () => {
  const teamBuilder = Team.parallelTeam();
  const devCount = getInputValueOf('#dev-count-input');
  Array.from({ length: devCount }, (_, i) => {
    return { id: i, power: getInputValueOf(`#power-input-${i}`) };
  }).forEach((thread) => teamBuilder.withDev(thread));

  const reviewersCount = getInputValueOf('#reviewers-input');
  const hasReview = reviewersCount > 0;
  teamBuilder.withReview(hasReview);

  return teamBuilder.build();
};

const generateDevForm = (id: number) => {
  const identifierLabel = document.createElement('span');
  identifierLabel.textContent = 'Id';
  const identifier = document.createElement('span');
  identifier.id = `identifier-${id}`;
  identifier.textContent = id.toString();

  const powerLabel = document.createElement('label');
  powerLabel.textContent = 'Power';

  const powerInput = document.createElement('input');
  powerInput.id = `power-input-${id}`;
  powerInput.type = 'number';
  powerInput.min = '1';
  powerInput.value = '1';

  const dev = document.createElement('div');
  dev.append(identifierLabel, identifier, powerLabel, powerInput);
  return dev;
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
});
