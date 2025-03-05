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

export const buildBacklog = () => {
  const taskCount = parseInt(
    document.querySelector<HTMLInputElement>('#task-count-input')?.value ?? '0',
  );
  const reviewersCount =
    document.querySelector<HTMLInputElement>('#reviewers-input')?.value;
  const backlogBuilder = Backlog.init();
  Array.from({ length: taskCount }, (_, i) =>
    backlogBuilder.addUserStory(createUserStory(i, Number(reviewersCount))),
  );
  return backlogBuilder.build();
};

export const buildParallelTeam = () => {
  const devCount = parseInt(
    document.querySelector<HTMLInputElement>('#dev-count-input')?.value ?? '0',
  );
  const reviewersCount =
    document.querySelector<HTMLInputElement>('#reviewers-input')?.value;
  const hasReview = !!reviewersCount && Number(reviewersCount) > 0;
  return Team.parallelTeam()
    .withDevCount(devCount)
    .withReview(hasReview)
    .build();
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
      const devCount = parseInt(
        document.querySelector<HTMLInputElement>('#dev-count-input')?.value ??
          '0',
      );
      const devs = Array.from({ length: devCount }, (_, i) =>
        generateDevForm(i),
      );
      devsContainer?.replaceChildren(...devs);
    });
});
