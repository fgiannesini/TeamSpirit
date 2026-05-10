import { defineStore } from 'pinia';
import { type Backlog, copy } from '../simulate/backlog.ts';
import { noBugGenerator } from '../simulate/bug-generator.ts';
import type { TimeEvent } from '../simulate/events.ts';
import {
  createBacklog,
  createThread,
  ensembleTeam,
  parallelTeam,
  todo,
} from '../simulate/factory.ts';
import {
  CustomPriorityModificator,
  noPriorityModificator,
  type PriorityModificatorEvent,
  RandomPriorityModificator,
} from '../simulate/priority-modificator.ts';
import { simulate } from '../simulate/simulation.ts';
import type { StructureEvent } from '../simulate/simulation-structure.ts';
import { computeStatEvents, type StatEvent } from '../simulate/stats.ts';
import type { Team, TeamType } from '../simulate/team.ts';
import {
  CustomTeamModificator,
  noTeamModificator,
  RandomTeamModificator,
  type TeamModificatorEvent,
} from '../simulate/team-modificator.ts';

const developerName = (id: number): string => `Developer ${id}`;

const tomorrow = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
};

export type State = {
  teamMode: SelectorMode;
  teamModificatorMode: SelectorMode;
  priorityModificatorMode: SelectorMode;
  userStoriesMode: SelectorMode;
  developers: Developer[];
  teamModificators: TeamModification[];
  priorityModificators: PriorityModification[];
  reviewers: number;
  userStories: UserStory[];
  simulationOutputs: SimulationOutputs[];
};

export type SelectorMode = 'random' | 'custom' | 'notSet';

export type Developer = {
  id: number;
  experience: number;
};

export type Period = {
  start: Date;
  end: Date;
};
export type TeamModification = {
  id: number;
  selectedDevelopers: Developer[];
  period: Period;
};

export type UserStory = {
  id: number;
  complexity: number;
  reviewComplexity: number;
  priority: number;
};

export type PriorityModification = {
  id: number;
  date: Date;
  selectedUserStories: UserStory[];
  priority: number;
};

export type SimulationInputs = {
  team: Team;
  backlog: Backlog;
};

export type SimulationOutputs = {
  teamType: TeamType;
  structureEvents: StructureEvent[];
  timeEvents: TimeEvent[];
  statEvents: StatEvent[];
};

type SimulationProviders = {
  userStoriesCount: number;
  complexityGenerator: () => number;
  reviewComplexityGenerator: () => number;
  priorityGenerator: () => number;
};

type TeamProvider = {
  teamCount: number;
  experienceGenerator: () => number;
};

const nextId = (items: { id: number }[]): number =>
  items.length > 0 ? Math.max(...items.map(({ id }) => id)) + 1 : 0;

type ToSimulationInputsOptions = {
  providers?: Partial<SimulationProviders>;
  teamProvider?: Partial<TeamProvider>;
};

export const useFormStore = defineStore('form', {
  state: (): State => ({
    teamMode: 'notSet',
    teamModificatorMode: 'notSet',
    priorityModificatorMode: 'notSet',
    userStoriesMode: 'notSet',
    developers: [],
    teamModificators: [],
    priorityModificators: [],
    reviewers: 0,
    userStories: [],
    simulationOutputs: [],
  }),
  actions: {
    generateDeveloper(): void {
      this.developers = [...this.developers, { id: nextId(this.developers), experience: 3 }];
    },
    removeDeveloper(targetId: number): void {
      this.developers = this.developers.filter(({ id }) => id !== targetId);
    },
    generateTeamModification(): void {
      this.teamModificators = [
        ...this.teamModificators,
        {
          id: nextId(this.teamModificators),
          selectedDevelopers: [],
          period: { start: new Date(), end: tomorrow() },
        },
      ];
    },
    removeTeamModification(targetId: number): void {
      this.teamModificators = this.teamModificators.filter(({ id }) => id !== targetId);
    },
    generatePriorityModification(): void {
      this.priorityModificators = [
        ...this.priorityModificators,
        {
          id: nextId(this.priorityModificators),
          date: new Date(),
          selectedUserStories: [],
          priority: 1,
        },
      ];
    },
    removePriorityModification(targetId: number): void {
      this.priorityModificators = this.priorityModificators.filter(({ id }) => id !== targetId);
    },
    generateUserStory(): void {
      this.userStories = [
        ...this.userStories,
        { id: nextId(this.userStories), complexity: 3, reviewComplexity: 2, priority: 1 },
      ];
    },
    removeUserStory(targetId: number): void {
      this.userStories = this.userStories.filter(({ id }) => id !== targetId);
    },
    toSimulationInputs(options: ToSimulationInputsOptions = {}): SimulationInputs[] {
      let backlog: Backlog;
      if (this.userStoriesMode === 'random') {
        const providers: SimulationProviders = {
          userStoriesCount: randomInt(Math.random, 100),
          complexityGenerator: () => randomInt(Math.random, 10),
          reviewComplexityGenerator: () => randomInt(Math.random, 10),
          priorityGenerator: () => randomInt(Math.random, 10),
          ...options.providers,
        };
        backlog = createBacklog({
          userStoriesRemaining: Array.from({ length: providers.userStoriesCount }, (_, index) =>
            todo({
              id: index,
              complexity: providers.complexityGenerator(),
              review: {
                reviewers: new Map(),
                reviewComplexity: providers.reviewComplexityGenerator(),
              },
              priority: providers.priorityGenerator(),
            }),
          ),
        });
      } else {
        backlog = createBacklog({
          userStoriesRemaining: this.userStories.map(
            ({ id, complexity, reviewComplexity, priority }) =>
              todo({
                id,
                complexity,
                review: {
                  reviewers: new Map(),
                  reviewComplexity,
                },
                priority,
              }),
          ),
        });
      }

      let threads;
      if (this.teamMode === 'random') {
        const teamProvider: TeamProvider = {
          teamCount: randomInt(Math.random, 10),
          experienceGenerator: () => randomInt(Math.random, 7),
          ...options.teamProvider,
        };
        threads = Array.from({ length: teamProvider.teamCount }, (_, index) =>
          createThread({
            id: index,
            name: developerName(index),
            power: teamProvider.experienceGenerator(),
          }),
        );
      } else {
        threads = this.developers.map((developer) =>
          createThread({
            id: developer.id,
            name: developerName(developer.id),
            power: developer.experience,
          }),
        );
      }
      return [
        {
          team: parallelTeam(threads, this.reviewers),
          backlog,
        },
        {
          team: ensembleTeam(threads),
          backlog,
        },
      ];
    },
    runSimulation(
      iterationCount: number,
      inputs?: SimulationInputs[],
      simulateFn: typeof simulate = simulate,
      computeStatEventsFn: typeof computeStatEvents = computeStatEvents,
      randomProvider: () => number = Math.random,
    ): void {
      const teamModificator =
        this.teamModificatorMode === 'random'
          ? new RandomTeamModificator(randomProvider)
          : this.teamModificatorMode === 'custom'
            ? new CustomTeamModificator(toTeamModificatorEvents(this.teamModificators, new Date()))
            : noTeamModificator;
      const priorityModificator =
        this.priorityModificatorMode === 'random'
          ? new RandomPriorityModificator(randomProvider)
          : this.priorityModificatorMode === 'custom'
            ? new CustomPriorityModificator(
                toPriorityModificatorEvents(this.priorityModificators, new Date()),
              )
            : noPriorityModificator;
      this.simulationOutputs = Array.from({ length: iterationCount }).flatMap(() => {
        const resolvedInputs = inputs ?? this.toSimulationInputs();
        return resolvedInputs.map(({ backlog, team }) => {
          const { timeEvents, structureEvents } = simulateFn(
            copy(backlog),
            team.copy(),
            noBugGenerator,
            teamModificator,
            priorityModificator,
          );
          const statEvents = computeStatEventsFn(timeEvents);
          return {
            timeEvents,
            statEvents,
            structureEvents,
            teamType: team.getType(),
          };
        });
      });
    },
  },
});

const randomInt = (randomProvider: () => number, max: number): number =>
  Math.floor(randomProvider() * max) + 1;

const toMidnight = (date: Date): number => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.getTime();
};

const daysBetween = (a: Date, b: Date): number =>
  Math.floor((toMidnight(b) - toMidnight(a)) / 86400000);

export const toTeamModificatorEvents = (
  modifications: TeamModification[],
  today: Date,
): TeamModificatorEvent[] =>
  modifications.flatMap(({ selectedDevelopers, period }) =>
    selectedDevelopers.map((developer) => ({
      off: Math.max(1, daysBetween(today, period.start) + 1),
      in: Math.max(1, daysBetween(today, period.end) + 1),
      threadName: developerName(developer.id),
    })),
  );

export const toPriorityModificatorEvents = (
  modifications: PriorityModification[],
  today: Date,
): PriorityModificatorEvent[] =>
  modifications.flatMap(({ date, selectedUserStories, priority }) =>
    selectedUserStories.map((userStory) => ({
      time: Math.max(1, daysBetween(today, date) + 1),
      id: userStory.id,
      priority,
    })),
  );
