import './style.scss';
import { EnsembleTeam, ParallelTeam, Team } from './simulate/team.ts';
import { Backlog } from './simulate/backlog.ts';
import { State } from './simulate/user-story.ts';
import {
  saveStatEvents,
  saveTimeEvents,
} from './flow/storage/session-storage.ts';
import { computeStatEvents } from './simulate/stats.ts';
import { generateDevForm, generateUserStoriesForm } from './form/form.ts';
import { simulate } from './simulate/simulation.ts';
import { noReview } from './simulate/review.ts';

const getInputValueOf = (selector: string) => {
  const number = parseInt(
    document.querySelector<HTMLInputElement>(selector)?.value ?? '0',
  );
  return isNaN(number) ? 0 : number;
};

export const buildBacklogForParallelTeam = () => {
  const userStoryCount = getInputValueOf('#user-story-count-input');
  const reviewersCount = getInputValueOf('#reviewers-input');
  return new Backlog(
    Array.from({ length: userStoryCount }, (_, i) => ({
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
    })),
  );
};

export const buildBacklogForEnsembleTeam = () => {
  const userStoryCount = getInputValueOf('#user-story-count-input');
  return new Backlog(
    Array.from({ length: userStoryCount }, (_, i) => ({
      name: `US${i}`,
      complexity: getInputValueOf(`#complexity-input-${i}`),
      review: noReview,
      reviewComplexity: getInputValueOf(`#review-complexity-input-${i}`),
      state: State.TODO,
      thread: undefined,
      progression: 0,
    })),
  );
};

export const buildParallelTeam = (): Team => {
  const devCount = getInputValueOf('#dev-count-input');
  const threads = Array.from({ length: devCount }, (_, i) => {
    return { id: i, power: getInputValueOf(`#power-input-${i}`) };
  });
  return new ParallelTeam(threads);
};

export const buildEnsembleTeam = (): Team => {
  const devCount = getInputValueOf('#dev-count-input');
  const threads = Array.from({ length: devCount }, (_, i) => {
    return { id: i, power: getInputValueOf(`#power-input-${i}`) };
  });
  return new EnsembleTeam(threads);
};

const runSimulation = (backlog: Backlog, team: Team) => {
  const timeEvents = simulate(backlog, team);
  const randomKey = crypto.randomUUID();
  saveTimeEvents(timeEvents, randomKey);
  const statEvents = computeStatEvents(timeEvents);
  saveStatEvents(statEvents, randomKey);
  return randomKey;
};

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelector<HTMLButtonElement>('#calculate-button')
    ?.addEventListener('click', () => {
      const ensembleTeamBacklog = buildBacklogForEnsembleTeam();
      const ensembleRandomKey = runSimulation(
        ensembleTeamBacklog,
        buildEnsembleTeam(),
      );
      window.open(`/TeamSpirit/flow/flow.html?id=${ensembleRandomKey}`);
      window.open(
        `/TeamSpirit/time-sequence/time-sequence.html?id=${ensembleRandomKey}`,
      );
      const parallelTeamBacklog = buildBacklogForParallelTeam();
      const parallelRandomKey = runSimulation(
        parallelTeamBacklog,
        buildParallelTeam(),
      );
      window.open(`/TeamSpirit/flow/flow.html?id=${parallelRandomKey}`);
      window.open(
        `/TeamSpirit/time-sequence/time-sequence.html?id=${parallelRandomKey}`,
      );
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
