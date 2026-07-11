import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  CustomBugGenerator,
  noBugGenerator,
  RandomBugGenerator,
} from '../simulate/backlog/bug-generator.ts';
import {
  createBacklog,
  createThread,
  ensembleTeam,
  parallelTeam,
  todo,
} from '../simulate/factory.ts';
import type { simulate } from '../simulate/engine/simulation.ts';
import type { computeStatEvents } from '../simulate/stats/stats.ts';
import {
  CustomPriorityModificator,
  noPriorityModificator,
  RandomPriorityModificator,
} from '../simulate/backlog/priority-modificator.ts';
import {
  CustomTeamModificator,
  noTeamModificator,
  RandomTeamModificator,
} from '../simulate/team/team-modificator.ts';
import {
  type SimulationInputs,
  type SimulationOutputs,
  type State,
  toBugGeneratorEvents,
  toPriorityModificatorEvents,
  toTeamModificatorEvents,
  useFormStore,
} from './form-store.ts';
import {
  bugGeneration,
  developer,
  priorityModification,
  teamModification,
  userStory,
} from './front-factory-for-test.ts';

const simulateMock = vi.fn<typeof simulate>();
const computeStatEventsMock = vi.fn<typeof computeStatEvents>();

describe('Form store', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    simulateMock.mockReturnValue({
      timeEvents: [{ time: 1, state: 'InProgress', threadId: 0, userStoryId: 0 }],
      structureEvents: [
        {
          time: 1,
          id: 0,
          name: 'thread',
          action: 'CreateThread',
        },
      ],
    });
    computeStatEventsMock
      .mockReturnValueOnce([{ time: 1, leadTime: 1 }])
      .mockReturnValue([{ time: 1, leadTime: 0.7 }]);

    setActivePinia(createPinia());
    vi.useFakeTimers({
      now: new Date('2025-12-25'),
    });
  });

  test('should initialise the store', () => {
    const store = useFormStore();
    expect(store.$state).toMatchObject<Partial<State>>({
      teamMode: 'notSet',
    });
  });

  describe('Developers', () => {
    test('should generate a developper', () => {
      const store = useFormStore();
      store.generateDeveloper();
      expect(store.$state).toMatchObject<Partial<State>>({
        developers: [
          {
            id: 0,
            experience: 3,
          },
        ],
      });
    });

    test('Should generate two developers', () => {
      const store = useFormStore();
      store.generateDeveloper();
      store.generateDeveloper();
      expect(store.$state).toMatchObject<Partial<State>>({
        developers: [
          {
            id: 0,
            experience: 3,
          },
          {
            id: 1,
            experience: 3,
          },
        ],
      });
    });

    test('Should remove a developer card', () => {
      const store = useFormStore();
      store.$patch({
        developers: [
          {
            id: 0,
            experience: 3,
          },
          {
            id: 1,
            experience: 3,
          },
          {
            id: 2,
            experience: 3,
          },
        ],
      });
      store.removeDeveloper(1);
      expect(store.$state).toMatchObject<Partial<State>>({
        developers: [
          {
            id: 0,
            experience: 3,
          },
          {
            id: 2,
            experience: 3,
          },
        ],
      });
    });

    test('Should add a developer after the last one', () => {
      const store = useFormStore();
      store.$patch({
        developers: [
          {
            id: 1,
            experience: 3,
          },
        ],
      });
      store.generateDeveloper();

      expect(store.$state).toMatchObject<Partial<State>>({
        developers: [
          {
            id: 1,
            experience: 3,
          },
          {
            id: 2,
            experience: 3,
          },
        ],
      });
    });
  });

  describe('Team Modifications', () => {
    test('should generate a team modification', () => {
      const store = useFormStore();
      store.generateTeamModification();
      expect(store.$state).toMatchObject<Partial<State>>({
        teamModificators: [
          teamModification({
            id: 0,
          }),
        ],
      });
    });

    test('Should generate two team modifications', () => {
      const store = useFormStore();
      store.generateTeamModification();
      store.generateTeamModification();
      expect(store.$state).toMatchObject<Partial<State>>({
        teamModificators: [
          teamModification({
            id: 0,
          }),
          teamModification({
            id: 1,
          }),
        ],
      });
    });

    test('Should remove a team modification', () => {
      const store = useFormStore();
      store.$patch({
        teamModificators: [
          teamModification({
            id: 0,
          }),
          teamModification({
            id: 1,
          }),
          teamModification({
            id: 2,
          }),
        ],
      });
      store.removeTeamModification(1);
      expect(store.$state).toMatchObject<Partial<State>>({
        teamModificators: [
          teamModification({
            id: 0,
          }),
          teamModification({
            id: 2,
          }),
        ],
      });
    });

    test('Should add a team modification after the last one', () => {
      const store = useFormStore();
      store.$patch({
        teamModificators: [
          teamModification({
            id: 1,
          }),
        ],
      });
      store.generateTeamModification();

      expect(store.$state).toMatchObject<Partial<State>>({
        teamModificators: [
          teamModification({
            id: 1,
          }),
          teamModification({
            id: 2,
          }),
        ],
      });
    });
  });

  describe('Priority Modifications', () => {
    test('should generate a priority modification', () => {
      const store = useFormStore();
      store.generatePriorityModification();
      expect(store.$state).toMatchObject<Partial<State>>({
        priorityModificators: [priorityModification({ id: 0 })],
      });
    });

    test('should generate two priority modifications with ids 0 and 1', () => {
      const store = useFormStore();
      store.generatePriorityModification();
      store.generatePriorityModification();
      expect(store.$state).toMatchObject<Partial<State>>({
        priorityModificators: [priorityModification({ id: 0 }), priorityModification({ id: 1 })],
      });
    });

    test('should remove the targeted priority modification', () => {
      const store = useFormStore();
      store.$patch({
        priorityModificators: [
          priorityModification({ id: 0 }),
          priorityModification({ id: 1 }),
          priorityModification({ id: 2 }),
        ],
      });
      store.removePriorityModification(1);
      expect(store.$state).toMatchObject<Partial<State>>({
        priorityModificators: [priorityModification({ id: 0 }), priorityModification({ id: 2 })],
      });
    });

    test('Should add a priority modification after the last one', () => {
      const store = useFormStore();
      store.$patch({
        priorityModificators: [priorityModification({ id: 3 })],
      });
      store.generatePriorityModification();
      expect(store.$state).toMatchObject<Partial<State>>({
        priorityModificators: [priorityModification({ id: 3 }), priorityModification({ id: 4 })],
      });
    });
  });

  describe('Bug Generations', () => {
    test('should generate a bug generation', () => {
      const store = useFormStore();
      store.generateBugGeneration();
      expect(store.$state).toMatchObject<Partial<State>>({
        bugGenerations: [bugGeneration({ id: 0 })],
      });
    });

    test('should generate two bug generations with ids 0 and 1', () => {
      const store = useFormStore();
      store.generateBugGeneration();
      store.generateBugGeneration();
      expect(store.$state).toMatchObject<Partial<State>>({
        bugGenerations: [bugGeneration({ id: 0 }), bugGeneration({ id: 1 })],
      });
    });

    test('should remove the targeted bug generation', () => {
      const store = useFormStore();
      store.$patch({
        bugGenerations: [
          bugGeneration({ id: 0 }),
          bugGeneration({ id: 1 }),
          bugGeneration({ id: 2 }),
        ],
      });
      store.removeBugGeneration(1);
      expect(store.$state).toMatchObject<Partial<State>>({
        bugGenerations: [bugGeneration({ id: 0 }), bugGeneration({ id: 2 })],
      });
    });

    test('should add a bug generation after the last one', () => {
      const store = useFormStore();
      store.$patch({
        bugGenerations: [bugGeneration({ id: 3 })],
      });
      store.generateBugGeneration();
      expect(store.$state).toMatchObject<Partial<State>>({
        bugGenerations: [bugGeneration({ id: 3 }), bugGeneration({ id: 4 })],
      });
    });
  });

  describe('User stories', () => {
    test('should generate a user story', () => {
      const store = useFormStore();
      store.generateUserStory();
      expect(store.$state).toMatchObject<Partial<State>>({
        userStories: [
          userStory({
            id: 0,
          }),
        ],
      });
    });

    test('Should generate two user stories', () => {
      const store = useFormStore();
      store.generateUserStory();
      store.generateUserStory();
      expect(store.$state).toMatchObject<Partial<State>>({
        userStories: [
          userStory({
            id: 0,
          }),
          userStory({
            id: 1,
          }),
        ],
      });
    });

    test('Should remove a user story', () => {
      const store = useFormStore();
      store.$patch({
        userStories: [
          userStory({
            id: 0,
          }),
          userStory({
            id: 1,
          }),
          userStory({
            id: 2,
          }),
        ],
      });
      store.removeUserStory(1);
      expect(store.$state).toMatchObject<Partial<State>>({
        userStories: [
          userStory({
            id: 0,
          }),
          userStory({
            id: 2,
          }),
        ],
      });
    });

    test('Should add a user story after the last one', () => {
      const store = useFormStore();
      store.$patch({
        userStories: [
          userStory({
            id: 1,
          }),
        ],
      });
      store.generateUserStory();

      expect(store.$state).toMatchObject<Partial<State>>({
        userStories: [
          userStory({
            id: 1,
          }),
          userStory({
            id: 2,
          }),
        ],
      });
    });
  });

  describe('Generate simulation inputs', () => {
    test('should generate two teams', () => {
      const store = useFormStore();
      store.$patch({
        developers: [developer({ id: 0 })],
        userStories: [userStory()],
      });
      const simulationInputs = store.toSimulationInputs();
      expect(simulationInputs).toStrictEqual<SimulationInputs[]>([
        {
          team: parallelTeam([createThread({ id: 0, name: 'Developer 0', power: 3 })], 0),
          backlog: createBacklog({
            userStoriesRemaining: [
              todo({
                name: 'US-0',
                complexity: 3,
                priority: 1,
                review: { reviewComplexity: 2, reviewers: new Map() },
              }),
            ],
          }),
        },
        {
          team: ensembleTeam([createThread({ id: 0, name: 'Developer 0', power: 3 })]),
          backlog: createBacklog({
            userStoriesRemaining: [
              todo({
                name: 'US-0',
                complexity: 3,
                priority: 1,
                review: { reviewComplexity: 2, reviewers: new Map() },
              }),
            ],
          }),
        },
      ]);
    });

    test('should generate random user stories', () => {
      const store = useFormStore();
      store.$patch({
        developers: [developer({ id: 0 })],
        userStoriesMode: 'random',
      });
      const simulationInputs = store.toSimulationInputs({
        providers: {
          userStoriesCount: 2,
          complexityGenerator: vi.fn<() => number>().mockReturnValueOnce(2).mockReturnValue(3),
          reviewComplexityGenerator: vi
            .fn<() => number>()
            .mockReturnValueOnce(1)
            .mockReturnValue(2),
          priorityGenerator: vi.fn<() => number>().mockReturnValueOnce(1).mockReturnValue(2),
        },
      });
      expect(simulationInputs[0].backlog).toStrictEqual(
        createBacklog({
          userStoriesRemaining: [
            todo({
              id: 0,
              name: 'US-0',
              complexity: 2,
              review: {
                reviewers: new Map(),
                reviewComplexity: 1,
              },
              priority: 1,
            }),
            todo({
              id: 1,
              name: 'US-1',
              complexity: 3,
              review: {
                reviewers: new Map(),
                reviewComplexity: 2,
              },
              priority: 2,
            }),
          ],
        }),
      );
      expect(simulationInputs[0].backlog).toStrictEqual(simulationInputs[1].backlog);
    });

    test('should use story id (not position index) as name in selected mode', () => {
      const store = useFormStore();
      store.$patch({
        developers: [developer({ id: 0 })],
        userStories: [userStory({ id: 2 })],
      });
      const simulationInputs = store.toSimulationInputs();
      expect(simulationInputs[0].backlog).toStrictEqual(
        createBacklog({
          userStoriesRemaining: [
            todo({
              id: 2,
              name: 'US-2',
              complexity: 3,
              review: { reviewComplexity: 2, reviewers: new Map() },
              priority: 1,
            }),
          ],
        }),
      );
    });

    test('Should generate random team', () => {
      const store = useFormStore();
      store.$patch({
        teamMode: 'random',
      });
      const simulationInputs = store.toSimulationInputs({
        teamProvider: {
          teamCount: 2,
          experienceGenerator: vi.fn<() => number>().mockReturnValueOnce(1).mockReturnValue(2),
        },
      });
      expect(simulationInputs[0].team).toStrictEqual(
        parallelTeam(
          [
            createThread({ id: 0, name: 'Developer 0', power: 1 }),
            createThread({ id: 1, name: 'Developer 1', power: 2 }),
          ],
          0,
        ),
      );
      expect(simulationInputs[1].team).toStrictEqual(
        ensembleTeam([
          createThread({ id: 0, name: 'Developer 0', power: 1 }),
          createThread({ id: 1, name: 'Developer 1', power: 2 }),
        ]),
      );
    });
  });

  describe('toTeamModificatorEvents', () => {
    test('should return empty array when no modifications', () => {
      expect(toTeamModificatorEvents([], new Date())).toStrictEqual([]);
    });

    test('should return empty array when modification has no developers', () => {
      expect(
        toTeamModificatorEvents([teamModification({ selectedDevelopers: [] })], new Date()),
      ).toStrictEqual([]);
    });

    test('should map each developer of each modification to an event with the right offsets', () => {
      const events = toTeamModificatorEvents(
        [
          teamModification({
            selectedDevelopers: [developer({ id: 0 }), developer({ id: 1 })],
            period: { start: new Date('2025-12-28'), end: new Date('2025-12-30') },
          }),
          teamModification({
            selectedDevelopers: [developer({ id: 2 })],
            period: { start: new Date('2025-12-29'), end: new Date('2025-12-31') },
          }),
        ],
        new Date('2025-12-25'),
      );
      expect(events).toStrictEqual([
        { off: 4, in: 6, threadName: 'Developer 0' },
        { off: 4, in: 6, threadName: 'Developer 1' },
        { off: 5, in: 7, threadName: 'Developer 2' },
      ]);
    });

    test('should clamp off to 1 for a past or today period start', () => {
      const events = toTeamModificatorEvents(
        [
          teamModification({
            selectedDevelopers: [developer({ id: 0 })],
            period: { start: new Date('2025-12-24'), end: new Date('2025-12-30') },
          }),
          teamModification({
            selectedDevelopers: [developer({ id: 1 })],
            period: { start: new Date('2025-12-25'), end: new Date('2025-12-30') },
          }),
        ],
        new Date('2025-12-25'),
      );
      expect(events.map((e) => e.off)).toStrictEqual([1, 1]);
    });

    test('should clamp in to 1 when period end is before today', () => {
      const events = toTeamModificatorEvents(
        [
          teamModification({
            selectedDevelopers: [developer({ id: 0 })],
            period: { start: new Date('2025-12-28'), end: new Date('2025-12-24') },
          }),
        ],
        new Date('2025-12-25'),
      );
      expect(events[0].in).toBe(1);
    });
  });

  describe('toPriorityModificatorEvents', () => {
    test('should return empty array when no modifications', () => {
      expect(toPriorityModificatorEvents([], new Date())).toStrictEqual([]);
    });

    test('should return empty array when modification has no user stories', () => {
      expect(
        toPriorityModificatorEvents(
          [priorityModification({ selectedUserStories: [] })],
          new Date(),
        ),
      ).toStrictEqual([]);
    });

    test('should map each user story of each modification to an event with the right offset', () => {
      const events = toPriorityModificatorEvents(
        [
          priorityModification({
            selectedUserStories: [userStory({ id: 0 }), userStory({ id: 1 })],
            date: new Date('2025-12-28'),
            priority: 5,
          }),
          priorityModification({
            selectedUserStories: [userStory({ id: 2 })],
            date: new Date('2025-12-29'),
            priority: 3,
          }),
        ],
        new Date('2025-12-25'),
      );
      expect(events).toStrictEqual([
        { time: 4, id: 0, priority: 5 },
        { time: 4, id: 1, priority: 5 },
        { time: 5, id: 2, priority: 3 },
      ]);
    });

    test('should clamp time to 1 for a past or today date', () => {
      const events = toPriorityModificatorEvents(
        [
          priorityModification({
            selectedUserStories: [userStory({ id: 0 })],
            date: new Date('2025-12-24'),
            priority: 5,
          }),
          priorityModification({
            selectedUserStories: [userStory({ id: 1 })],
            date: new Date('2025-12-25'),
            priority: 5,
          }),
        ],
        new Date('2025-12-25'),
      );
      expect(events.map((e) => e.time)).toStrictEqual([1, 1]);
    });
  });

  describe('toBugGeneratorEvents', () => {
    test('should return empty array when no generations', () => {
      expect(toBugGeneratorEvents([], new Date())).toStrictEqual([]);
    });

    test('should map each generation to an event with the right offset', () => {
      const events = toBugGeneratorEvents(
        [
          bugGeneration({
            date: new Date('2025-12-28'),
            complexity: 5,
            reviewComplexity: 3,
            priority: 2,
          }),
          bugGeneration({
            date: new Date('2025-12-29'),
            complexity: 4,
            reviewComplexity: 1,
            priority: 3,
          }),
        ],
        new Date('2025-12-25'),
      );
      expect(events).toStrictEqual([
        { time: 4, complexity: 5, reviewComplexity: 3, priority: 2 },
        { time: 5, complexity: 4, reviewComplexity: 1, priority: 3 },
      ]);
    });

    test('should clamp time to 1 for a past or today date', () => {
      const events = toBugGeneratorEvents(
        [
          bugGeneration({ date: new Date('2025-12-24') }),
          bugGeneration({ date: new Date('2025-12-25') }),
        ],
        new Date('2025-12-25'),
      );
      expect(events.map((e) => e.time)).toStrictEqual([1, 1]);
    });
  });

  describe('Simulation', () => {
    test('Should run simulation and store in state', () => {
      const store = useFormStore();
      store.runSimulation(
        2,
        [
          {
            backlog: createBacklog(),
            team: parallelTeam(),
          },
        ],
        simulateMock,
        computeStatEventsMock,
      );
      expect(store.$state.simulationOutputs[0]).toStrictEqual<SimulationOutputs>({
        teamType: 'Parallel',
        timeEvents: [{ time: 1, state: 'InProgress', threadId: 0, userStoryId: 0 }],
        structureEvents: [
          {
            time: 1,
            id: 0,
            name: 'thread',
            action: 'CreateThread',
          },
        ],
        statEvents: [{ time: 1, leadTime: 1 }],
      });
      expect(store.$state.simulationOutputs[1]).toStrictEqual<SimulationOutputs>({
        teamType: 'Parallel',
        timeEvents: [{ time: 1, state: 'InProgress', threadId: 0, userStoryId: 0 }],
        structureEvents: [
          {
            time: 1,
            id: 0,
            name: 'thread',
            action: 'CreateThread',
          },
        ],
        statEvents: [{ time: 1, leadTime: 0.7 }],
      });
    });

    test('Should get new inputs on each iteration', () => {
      const store = useFormStore();
      store.toSimulationInputs = vi.fn<() => SimulationInputs[]>().mockReturnValue([]);
      store.runSimulation(2, undefined, simulateMock, computeStatEventsMock);
      expect(store.toSimulationInputs).toHaveBeenCalledTimes(2);
    });

    test('Should pass noTeamModificator when mode is notSet', () => {
      const store = useFormStore();
      store.runSimulation(
        1,
        [{ backlog: createBacklog(), team: parallelTeam() }],
        simulateMock,
        computeStatEventsMock,
      );
      expect(simulateMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        noTeamModificator,
        expect.anything(),
      );
    });

    test('Should pass RandomTeamModificator when mode is random', () => {
      const store = useFormStore();
      store.$patch({ teamModificatorMode: 'random' });
      const randomProvider = vi.fn(() => 0.5);
      store.runSimulation(
        1,
        [{ backlog: createBacklog(), team: parallelTeam() }],
        simulateMock,
        computeStatEventsMock,
        randomProvider,
      );
      expect(simulateMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.any(RandomTeamModificator),
        expect.anything(),
      );
    });

    test('Should pass CustomTeamModificator with events when mode is custom', () => {
      const store = useFormStore();
      store.$patch({
        teamModificatorMode: 'custom',
        teamModificators: [
          teamModification({
            selectedDevelopers: [developer({ id: 0 })],
            period: { start: new Date('2025-12-28'), end: new Date('2025-12-30') },
          }),
        ],
      });
      store.runSimulation(
        1,
        [{ backlog: createBacklog(), team: parallelTeam() }],
        simulateMock,
        computeStatEventsMock,
      );
      expect(simulateMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        new CustomTeamModificator([{ off: 4, in: 6, threadName: 'Developer 0' }]),
        expect.anything(),
      );
    });

    test('Should pass noPriorityModificator when priorityModificatorMode is notSet', () => {
      const store = useFormStore();
      store.runSimulation(
        1,
        [{ backlog: createBacklog(), team: parallelTeam() }],
        simulateMock,
        computeStatEventsMock,
      );
      expect(simulateMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        noPriorityModificator,
      );
    });

    test('Should pass RandomPriorityModificator when priorityModificatorMode is random', () => {
      const store = useFormStore();
      store.$patch({ priorityModificatorMode: 'random' });
      const randomProvider = vi.fn(() => 0.5);
      store.runSimulation(
        1,
        [{ backlog: createBacklog(), team: parallelTeam() }],
        simulateMock,
        computeStatEventsMock,
        randomProvider,
      );
      expect(simulateMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        new RandomPriorityModificator(randomProvider),
      );
    });

    test('Should pass CustomPriorityModificator with events when priorityModificatorMode is custom', () => {
      const store = useFormStore();
      store.$patch({
        priorityModificatorMode: 'custom',
        priorityModificators: [
          priorityModification({
            selectedUserStories: [userStory({ id: 0 })],
            date: new Date('2025-12-28'),
            priority: 5,
          }),
        ],
      });
      store.runSimulation(
        1,
        [{ backlog: createBacklog(), team: parallelTeam() }],
        simulateMock,
        computeStatEventsMock,
      );
      expect(simulateMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        new CustomPriorityModificator([{ time: 4, id: 0, priority: 5 }]),
      );
    });

    test('Should pass noBugGenerator when bugGeneratorMode is notSet', () => {
      const store = useFormStore();
      store.runSimulation(
        1,
        [{ backlog: createBacklog(), team: parallelTeam() }],
        simulateMock,
        computeStatEventsMock,
      );
      expect(simulateMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        noBugGenerator,
        expect.anything(),
        expect.anything(),
      );
    });

    test('Should pass RandomBugGenerator when bugGeneratorMode is random', () => {
      const store = useFormStore();
      store.$patch({ bugGeneratorMode: 'random' });
      const randomProvider = vi.fn(() => 0.5);
      store.runSimulation(
        1,
        [{ backlog: createBacklog(), team: parallelTeam() }],
        simulateMock,
        computeStatEventsMock,
        randomProvider,
      );
      expect(simulateMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        new RandomBugGenerator(randomProvider, randomProvider, randomProvider),
        expect.anything(),
        expect.anything(),
      );
    });

    test('Should pass CustomBugGenerator with events when bugGeneratorMode is custom', () => {
      const store = useFormStore();
      store.$patch({
        bugGeneratorMode: 'custom',
        bugGenerations: [
          bugGeneration({
            date: new Date('2025-12-28'),
            complexity: 5,
            reviewComplexity: 3,
            priority: 2,
          }),
        ],
      });
      store.runSimulation(
        1,
        [{ backlog: createBacklog(), team: parallelTeam() }],
        simulateMock,
        computeStatEventsMock,
      );
      expect(simulateMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        new CustomBugGenerator([{ time: 4, complexity: 5, reviewComplexity: 3, priority: 2 }]),
        expect.anything(),
        expect.anything(),
      );
    });
  });
});
