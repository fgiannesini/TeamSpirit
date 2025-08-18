import './style.scss';
import {
  saveStatEvents,
  saveStructureEvents,
  saveTimeEvents,
} from './flow/storage/session-storage.ts';
import {
  generateBugGeneratorEventsForm,
  generateDevForm,
  generatePriorityModificatorEventsForm,
  generateTeamModificatorEventsForm,
  generateUserStoriesForm,
} from './form/form.ts';
import { Backlog } from './simulate/backlog.ts';
import {
  type BugGenerator,
  type BugGeneratorEvent,
  CustomBugGenerator,
  noBugGenerator,
  RandomBugGenerator,
} from './simulate/bug-generator.ts';
import {
  CustomPriorityModificator,
  noPriorityModificator,
  type PriorityModificator,
  type PriorityModificatorEvent,
  RandomPriorityModificator,
} from './simulate/priority-modificator.ts';
import { noReview } from './simulate/review.ts';
import { simulate } from './simulate/simulation.ts';
import { computeStatEvents } from './simulate/stats.ts';
import {
  EnsembleTeam,
  ParallelTeam,
  type Team,
  type Thread,
} from './simulate/team.ts';
import {
  CustomTeamModificator,
  noTeamModificator,
  RandomTeamModificator,
  type TeamModificator,
  type TeamModificatorEvent,
} from './simulate/team-modificator.ts';
import type { UserStory } from './simulate/user-story.ts';

const getInputValueOf = (selector: string): number => {
  const number = Number.parseInt(
    document.querySelector<HTMLInputElement>(selector)?.value ?? '1',
    10,
  );
  return Number.isNaN(number) ? 0 : number;
};

const runSimulation = (
  backlog: Backlog,
  team: Team,
  bugGenerator: BugGenerator,
  teamModificator: TeamModificator,
): string => {
  const { timeEvents, structureEvents } = simulate(
    backlog,
    team,
    bugGenerator,
    teamModificator,
  );
  const randomKey = crypto.randomUUID();
  saveTimeEvents(timeEvents, randomKey);
  saveStructureEvents(structureEvents, randomKey);
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
        getBugGenerator(),
        getTeamModificator(),
      );
      window.open(`/TeamSpirit/flow/flow.html?id=${ensembleRandomKey}`);
      window.open(
        `/TeamSpirit/time-sequence/time-sequence.html?id=${ensembleRandomKey}`,
      );
      const parallelTeamBacklog = buildBacklogForParallelTeam();
      const parallelRandomKey = runSimulation(
        parallelTeamBacklog,
        buildParallelTeam(),
        getBugGenerator(),
        getTeamModificator(),
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

  document
    .querySelector<HTMLSelectElement>('#team-modificator')
    ?.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement;
      if (target.value === 'custom') {
        const eventsDiv = document.querySelector<HTMLDivElement>(
          '#team-modificator-events',
        );
        if (eventsDiv) {
          eventsDiv.style.display = 'block';
        }
      } else {
        const eventsDiv = document.querySelector<HTMLDivElement>(
          '#team-modificator-events',
        );
        if (eventsDiv) {
          eventsDiv.style.display = 'none';
        }
      }
    });

  let teamModificatorEventCount = 0;

  document
    .querySelector<HTMLSelectElement>('#team-modificator-add-event-button')
    ?.addEventListener('click', (event) => {
      const form = generateTeamModificatorEventsForm(teamModificatorEventCount);
      const target = event.target as HTMLDivElement;
      target.parentElement?.append(form);
      teamModificatorEventCount++;
    });

  document
    .querySelector<HTMLSelectElement>('#bug-generator')
    ?.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement;
      if (target.value === 'custom') {
        const eventsDiv = document.querySelector<HTMLDivElement>(
          '#bug-generator-events',
        );
        if (eventsDiv) {
          eventsDiv.style.display = 'block';
        }
      } else {
        const eventsDiv = document.querySelector<HTMLDivElement>(
          '#bug-generator-events',
        );
        if (eventsDiv) {
          eventsDiv.style.display = 'none';
        }
      }
    });

  let bugGeneratorEventCount = 0;

  document
    .querySelector<HTMLSelectElement>('#bug-generator-add-event-button')
    ?.addEventListener('click', (event) => {
      const form = generateBugGeneratorEventsForm(bugGeneratorEventCount);
      const target = event.target as HTMLDivElement;
      target.parentElement?.append(form);
      bugGeneratorEventCount++;
    });

  document
    .querySelector<HTMLSelectElement>('#priority-modificator')
    ?.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement;
      if (target.value === 'custom') {
        const eventsDiv = document.querySelector<HTMLDivElement>(
          '#priority-modificator-events',
        );
        if (eventsDiv) {
          eventsDiv.style.display = 'block';
        }
      } else {
        const eventsDiv = document.querySelector<HTMLDivElement>(
          '#priority-modificator-events',
        );
        if (eventsDiv) {
          eventsDiv.style.display = 'none';
        }
      }
    });

  let priorityModificatorEventCount = 0;

  document
    .querySelector<HTMLSelectElement>('#priority-modificator-add-event-button')
    ?.addEventListener('click', (event) => {
      const form = generatePriorityModificatorEventsForm(
        priorityModificatorEventCount,
      );
      const target = event.target as HTMLDivElement;
      target.parentElement?.append(form);
      priorityModificatorEventCount++;
    });
});

export const getBugGenerator = (): BugGenerator => {
  const generator =
    document.querySelector<HTMLSelectElement>('#bug-generator')?.value;
  if (generator === 'random') {
    return new RandomBugGenerator(
      () => Math.random(),
      () => Math.random(),
      () => Math.random(),
    );
  }
  if (generator === 'custom') {
    const eventsDivContainer = document.querySelectorAll(
      '#bug-generator-events div',
    );
    const events: BugGeneratorEvent[] = [];
    for (const eventDiv of eventsDivContainer) {
      events.push({
        time: getInputValueOf(`#${eventDiv.id}-time-input`),
        complexity: getInputValueOf(`#${eventDiv.id}-complexity-input`),
        reviewComplexity: getInputValueOf(
          `#${eventDiv.id}-review-complexity-input`,
        ),
        priority: getInputValueOf(`#${eventDiv.id}-priority-input`),
      });
    }
    return new CustomBugGenerator(events);
  }
  return noBugGenerator;
};

export const getTeamModificator = (): TeamModificator => {
  const modificator =
    document.querySelector<HTMLSelectElement>('#team-modificator')?.value;
  if (modificator === 'random') {
    return new RandomTeamModificator(() => Math.random());
  }
  if (modificator === 'custom') {
    const eventsDivContainer = document.querySelectorAll(
      '#team-modificator-events div',
    );
    const events: TeamModificatorEvent[] = [];
    for (const eventDiv of eventsDivContainer) {
      events.push({
        off: getInputValueOf(`#${eventDiv.id}-off-input`),
        in: getInputValueOf(`#${eventDiv.id}-in-input`),
        threadName:
          document.querySelector<HTMLInputElement>(
            `#${eventDiv.id}-thread-name-input`,
          )?.value ?? '',
      });
    }
    return new CustomTeamModificator(events);
  }
  return noTeamModificator;
};

export const getPriorityModificator = (): PriorityModificator => {
  const modificator = document.querySelector<HTMLSelectElement>(
    '#priority-modificator',
  )?.value;
  if (modificator === 'random') {
    return new RandomPriorityModificator(Math.random);
  }
  if (modificator === 'custom') {
    const eventsDivContainer = document.querySelectorAll(
      '#team-modificator-events div',
    );
    const events: PriorityModificatorEvent[] = [];
    for (const eventDiv of eventsDivContainer) {
      events.push({
        time: getInputValueOf(`#${eventDiv.id}-time-input`),
        id: getInputValueOf(`#${eventDiv.id}-id-input`),
        priority: getInputValueOf(`#${eventDiv.id}-priority-input`),
      });
    }
    return new CustomPriorityModificator(events);
  }
  return noPriorityModificator;
};

export const buildBacklogForParallelTeam = (): Backlog => {
  const userStoryCount = getInputValueOf('#user-story-count-input');
  return new Backlog(
    Array.from(
      { length: userStoryCount },
      (_, i): UserStory => ({
        id: i,
        name: `US${i}`,
        complexity: getInputValueOf(`#complexity-input-${i}`),
        review: {
          reviewers: new Map<number, number>(),
          reviewComplexity: getInputValueOf(`#review-complexity-input-${i}`),
        },
        state: 'Todo',
        threadId: undefined,
        progression: 0,
        timeDone: 0,
        priority: getInputValueOf(`#priority-input-${i}`),
      }),
    ),
  );
};

export const buildBacklogForEnsembleTeam = (): Backlog => {
  const userStoryCount = getInputValueOf('#user-story-count-input');
  return new Backlog(
    Array.from(
      { length: userStoryCount },
      (_, i): UserStory => ({
        id: i,
        name: `US${i}`,
        complexity: getInputValueOf(`#complexity-input-${i}`),
        review: noReview,
        state: 'Todo',
        threadId: undefined,
        progression: 0,
        timeDone: 0,
        priority: getInputValueOf(`#priority-input-${i}`),
      }),
    ),
  );
};

export const buildParallelTeam = (): Team => {
  const devCount = getInputValueOf('#dev-count-input');
  const reviewsCount = getInputValueOf('#reviewers-input');
  const threads: Thread[] = Array.from({ length: devCount }, (_, i) => {
    return {
      id: i,
      name: `thread${i}`,
      power: getInputValueOf(`#power-input-${i}`),
      inTime: 0,
      offTime: 0,
      off: false,
    };
  });
  return new ParallelTeam(threads, reviewsCount);
};

export const buildEnsembleTeam = (): Team => {
  const devCount = getInputValueOf('#dev-count-input');
  const threads: Thread[] = Array.from({ length: devCount }, (_, i) => {
    return {
      id: i,
      name: `thread${i}`,
      power: getInputValueOf(`#power-input-${i}`),
      inTime: 0,
      offTime: 0,
      off: false,
    };
  });
  return new EnsembleTeam(threads);
};
