import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  buildBacklogForEnsembleTeam,
  buildBacklogForParallelTeam,
  buildEnsembleTeam,
  buildParallelTeam,
  getBugGenerator,
  getPriorityModificator,
  getTeamModificator,
} from './index.ts';
import {
  CustomBugGenerator,
  noBugGenerator,
  RandomBugGenerator,
} from './simulate/bug-generator.ts';
import type { TimeEvent } from './simulate/events.ts';
import { createBacklog, createThread, todo } from './simulate/factory.ts';
import {
  CustomPriorityModificator,
  noPriorityModificator,
  RandomPriorityModificator,
} from './simulate/priority-modificator.ts';
import { noReview } from './simulate/review.ts';
import type { StructureEvent } from './simulate/simulation-structure.ts';
import type { StatEvent } from './simulate/stats.ts';
import { EnsembleTeam, ParallelTeam } from './simulate/team.ts';
import {
  CustomTeamModificator,
  noTeamModificator,
  RandomTeamModificator,
} from './simulate/team-modificator.ts';

const setSelectOption = (selectId: string, optionValue: string): void => {
  const select = document.querySelector<HTMLSelectElement>(`#${selectId}`);
  if (select) {
    select.value = optionValue;
    select.dispatchEvent(new Event('change'));
  }
};
describe('Main', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    vi.spyOn(window, 'open').mockImplementation(vi.fn());
    const htmlPath = resolve(__dirname, './index.html');
    document.body.innerHTML = readFileSync(htmlPath, 'utf-8');
    vi.mock('beercss', () => ({}));
    await import('./index.ts');
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  const setValueTo = (selectors: string, value: string): void => {
    const taskCountInput = document.querySelector<HTMLInputElement>(selectors);
    if (taskCountInput) {
      taskCountInput.value = value;
    }
  };
  const clickOn = (buttonId: string): void => {
    document.querySelector<HTMLButtonElement>(buttonId)?.click();
  };

  describe('Navigation', () => {
    test('Should compute and store time events in sessionStorage', () => {
      const randomUuidSpy = vi.spyOn(crypto, 'randomUUID');
      randomUuidSpy
        .mockReturnValueOnce('e4567-e89b-12d3-a456-426614174000')
        .mockReturnValueOnce('e4567-e89b-12d3-a456-426614174001');

      setValueTo('#user-story-count-input', '3');
      setValueTo('#dev-count-input', '2');
      clickOn('#generate-devs-button');

      setValueTo('#reviewers-input', '2');
      clickOn('#calculate-button');

      const timeEventsForParallelTeam = JSON.parse(
        sessionStorage.getItem(
          'computation-e4567-e89b-12d3-a456-426614174000',
        ) ?? '[]',
      ) as TimeEvent[];
      expect(timeEventsForParallelTeam.length).greaterThan(0);

      const timeEventsForEnsembleTeam = JSON.parse(
        sessionStorage.getItem(
          'computation-e4567-e89b-12d3-a456-426614174001',
        ) ?? '[]',
      ) as TimeEvent[];
      expect(timeEventsForEnsembleTeam.length).greaterThan(0);

      expect(randomUuidSpy).toHaveBeenCalledTimes(2);
    });

    test('Should compute and store stats events in sessionStorage', () => {
      const randomUuidSpy = vi.spyOn(crypto, 'randomUUID');
      randomUuidSpy
        .mockReturnValueOnce('e4567-e89b-12d3-a456-426614174000')
        .mockReturnValueOnce('e4567-e89b-12d3-a456-426614174001');

      setValueTo('#user-story-count-input', '1');
      setValueTo('#dev-count-input', '2');
      clickOn('#generate-devs-button');

      setValueTo('#reviewers-input', '');
      clickOn('#calculate-button');

      const statEventsForParallelTeam = JSON.parse(
        sessionStorage.getItem('stats-e4567-e89b-12d3-a456-426614174000') ??
          '[]',
      ) as StatEvent[];
      expect(statEventsForParallelTeam.length).greaterThan(0);

      const statEventsForEnsembleTeam = JSON.parse(
        sessionStorage.getItem('stats-e4567-e89b-12d3-a456-426614174001') ??
          '[]',
      ) as StatEvent[];
      expect(statEventsForEnsembleTeam.length).greaterThan(0);

      expect(randomUuidSpy).toHaveBeenCalledTimes(2);
    });

    test('Should compute and store structure events in sessionStorage', () => {
      const randomUuidSpy = vi.spyOn(crypto, 'randomUUID');
      randomUuidSpy
        .mockReturnValueOnce('e4567-e89b-12d3-a456-426614174000')
        .mockReturnValueOnce('e4567-e89b-12d3-a456-426614174001');

      setValueTo('#user-story-count-input', '1');
      setValueTo('#dev-count-input', '2');
      clickOn('#generate-devs-button');

      setValueTo('#reviewers-input', '');
      clickOn('#calculate-button');

      const structureEventsForParallelTeam = JSON.parse(
        sessionStorage.getItem('structure-e4567-e89b-12d3-a456-426614174000') ??
          '[]',
      ) as StructureEvent[];
      expect(structureEventsForParallelTeam.length).greaterThan(0);

      const structureEventsForEnsembleTeam = JSON.parse(
        sessionStorage.getItem('stats-e4567-e89b-12d3-a456-426614174001') ??
          '[]',
      ) as StructureEvent[];
      expect(structureEventsForEnsembleTeam.length).greaterThan(0);

      expect(randomUuidSpy).toHaveBeenCalledTimes(2);
    });

    test('Should open new pages', () => {
      const randomUuidSpy = vi.spyOn(crypto, 'randomUUID');
      randomUuidSpy
        .mockReturnValueOnce('e4567-e89b-12d3-a456-426614174000')
        .mockReturnValueOnce('e4567-e89b-12d3-a456-426614174001');

      const windowsOpenSpy = vi.spyOn(window, 'open');
      setValueTo('#user-story-count-input', '1');
      setValueTo('#dev-count-input', '2');
      clickOn('#generate-devs-button');

      setValueTo('#reviewers-input', '');
      clickOn('#calculate-button');

      expect(windowsOpenSpy).toHaveBeenCalledTimes(4);
      expect(windowsOpenSpy).toBeCalledWith(
        '/TeamSpirit/flow/flow.html?id=e4567-e89b-12d3-a456-426614174000',
      );
      expect(windowsOpenSpy).toBeCalledWith(
        '/TeamSpirit/time-sequence/time-sequence.html?id=e4567-e89b-12d3-a456-426614174000',
      );
      expect(windowsOpenSpy).toBeCalledWith(
        '/TeamSpirit/flow/flow.html?id=e4567-e89b-12d3-a456-426614174001',
      );
      expect(windowsOpenSpy).toBeCalledWith(
        '/TeamSpirit/time-sequence/time-sequence.html?id=e4567-e89b-12d3-a456-426614174001',
      );
    });
  });

  describe('Build backlog', () => {
    test('Should build the backlog for ensemble team with 2 user stories', () => {
      setValueTo('#user-story-count-input', '2');
      clickOn('#generate-user-stories-button');
      setValueTo('#complexity-input-0', '2');
      setValueTo('#review-complexity-input-0', '1');
      setValueTo('#priority-input-0', '0');
      setValueTo('#complexity-input-1', '4');
      setValueTo('#review-complexity-input-1', '2');
      setValueTo('#reviewers-input', '1');
      setValueTo('#priority-input-1', '5');
      expect(buildBacklogForEnsembleTeam()).toEqual(
        createBacklog({
          userStoriesRemaining: [
            todo({
              id: 0,
              name: 'US0',
              complexity: 2,
              review: noReview,
              priority: 0,
            }),
            todo({
              id: 1,
              name: 'US1',
              complexity: 4,
              review: noReview,
              priority: 5,
            }),
          ],
        }),
      );
    });

    test('Should build the backlog for parallel team with reviewers', () => {
      setValueTo('#user-story-count-input', '1');
      clickOn('#generate-user-stories-button');
      setValueTo('#complexity-input-0', '5');
      setValueTo('#review-complexity-input-0', '2');
      setValueTo('#priority-input-0', '3');
      setValueTo('#reviewers-input', '1');

      expect(buildBacklogForParallelTeam()).toEqual(
        createBacklog({
          userStoriesRemaining: [
            todo({
              id: 0,
              name: 'US0',
              complexity: 5,
              review: {
                reviewComplexity: 2,
                reviewers: new Map<number, number>(),
              },
              priority: 3,
            }),
          ],
        }),
      );
    });

    test('Should build the backlog for parallel team without reviewers', () => {
      setValueTo('#user-story-count-input', '1');
      clickOn('#generate-user-stories-button');
      setValueTo('#complexity-input-0', '5');
      setValueTo('#review-complexity-input-0', '2');
      setValueTo('#priority-input-0', '1');

      expect(buildBacklogForParallelTeam()).toEqual(
        createBacklog({
          userStoriesRemaining: [
            todo({
              id: 0,
              name: 'US0',
              complexity: 5,
              review: {
                reviewComplexity: 2,
                reviewers: new Map<number, number>(),
              },
              priority: 1,
            }),
          ],
        }),
      );
    });

    test('Should generate user stories', () => {
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.99)
        .mockReturnValueOnce(0.99)
        .mockReturnValue(0.99);
      setValueTo('#user-story-count-input', '2');
      clickOn('#generate-user-stories-button');
      const userStories = Array.from(
        document.querySelectorAll('#user-stories-container div'),
      );
      expect(userStories.length).toEqual(2);
      expect(
        document.querySelector(
          '#user-stories-container #user-story-identifier-0',
        )?.textContent,
      ).toEqual('0');
      expect(
        document.querySelector<HTMLInputElement>(
          '#user-stories-container #complexity-input-0',
        )?.value,
      ).toEqual('1');
      expect(
        document.querySelector<HTMLInputElement>(
          '#user-stories-container #review-complexity-input-0',
        )?.value,
      ).toEqual('1');
      expect(
        document.querySelector<HTMLInputElement>(
          '#user-stories-container #priority-input-0',
        )?.value,
      ).toEqual('0');
      expect(
        document.querySelector(
          '#user-stories-container #user-story-identifier-1',
        )?.textContent,
      ).toEqual('1');
      expect(
        document.querySelector<HTMLInputElement>(
          '#user-stories-container #complexity-input-1',
        )?.value,
      ).toEqual('10');
      expect(
        document.querySelector<HTMLInputElement>(
          '#user-stories-container #review-complexity-input-1',
        )?.value,
      ).toEqual('9');
      expect(
        document.querySelector<HTMLInputElement>(
          '#user-stories-container #priority-input-1',
        )?.value,
      ).toEqual('5');
    });
  });

  describe('Build team', () => {
    test('Should generate developers', () => {
      vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValue(0.99);
      setValueTo('#dev-count-input', '2');
      clickOn('#generate-devs-button');
      const devs = Array.from(document.querySelectorAll('#devs-container div'));
      expect(devs.length).toEqual(2);
      expect(
        document.querySelector('#devs-container #dev-identifier-0')
          ?.textContent,
      ).toEqual('0');
      expect(
        document.querySelector<HTMLInputElement>(
          '#devs-container #power-input-0',
        )?.value,
      ).toEqual('1');
      expect(
        document.querySelector('#devs-container #dev-identifier-1')
          ?.textContent,
      ).toEqual('1');
      expect(
        document.querySelector<HTMLInputElement>(
          '#devs-container #power-input-1',
        )?.value,
      ).toEqual('5');
    });

    test('Should generate developers once', () => {
      setValueTo('#dev-count-input', '2');
      clickOn('#generate-devs-button');
      clickOn('#generate-devs-button');
      const devs = Array.from(document.querySelectorAll('#devs-container div'));
      expect(devs.length).toEqual(2);
    });

    test('Should build a parallel team with 2 developers', () => {
      setValueTo('#dev-count-input', '2');
      clickOn('#generate-devs-button');
      setValueTo('#power-input-0', '5');
      setValueTo('#power-input-1', '10');
      expect(buildParallelTeam()).toStrictEqual(
        new ParallelTeam(
          [
            createThread({ id: 0, name: 'thread0', power: 5 }),
            createThread({ id: 1, name: 'thread1', power: 10 }),
          ],
          0,
        ),
      );
    });

    test('Should build a default parallel team', () => {
      setValueTo('#dev-count-input', '3');
      setValueTo('#reviewers-input', '2');
      expect(buildParallelTeam()).toStrictEqual(
        new ParallelTeam(
          [
            createThread({ id: 0, name: 'thread0', power: 1 }),
            createThread({ id: 1, name: 'thread1', power: 1 }),
            createThread({ id: 2, name: 'thread2', power: 1 }),
          ],
          2,
        ),
      );
    });

    test('Should build an ensemble team with 2 developers', () => {
      setValueTo('#dev-count-input', '2');
      clickOn('#generate-devs-button');
      setValueTo('#power-input-0', '5');
      setValueTo('#power-input-1', '10');
      expect(buildEnsembleTeam()).toStrictEqual(
        new EnsembleTeam([
          createThread({ id: 0, name: 'thread0', power: 5 }),
          createThread({ id: 1, name: 'thread1', power: 10 }),
        ]),
      );
    });
  });

  describe('Team modificator', () => {
    const getAddEventButton = (): HTMLButtonElement | null =>
      document.querySelector<HTMLButtonElement>(
        '#team-modificator-add-event-button',
      );

    const getRemoveEventButton = (id: number): HTMLButtonElement | null =>
      document.querySelector<HTMLButtonElement>(`#remove-event-button-${id}`);

    const getTeamModificatorDivEvents = (): HTMLDivElement | null =>
      document.querySelector<HTMLDivElement>('#team-modificator-events');

    test('Should create a no team modificator', () => {
      expect(getTeamModificator()).toEqual(noTeamModificator);
    });

    test('Should create a random team modificator', () => {
      setSelectOption('team-modificator', 'random');
      expect(getTeamModificator()).instanceof(RandomTeamModificator);
    });

    test('Should not propose team modificator events if not custom', () => {
      expect(getTeamModificatorDivEvents()?.style.display).toEqual('none');
    });

    test('Should create a custom team modification', () => {
      setSelectOption('team-modificator', 'custom');
      expect(getTeamModificatorDivEvents()?.style.display).toEqual('block');
    });

    test('Should hide team modificator events when random is selected after custom', () => {
      setSelectOption('team-modificator', 'custom');
      setSelectOption('team-modificator', 'random');
      expect(getTeamModificatorDivEvents()?.style.display).toEqual('none');
    });

    test('Should propose custom team modificator', () => {
      setSelectOption('team-modificator', 'custom');
      expect(getTeamModificator()).instanceof(CustomTeamModificator);
    });

    test('Should bind custom team modificator', () => {
      setSelectOption('team-modificator', 'custom');
      getAddEventButton()?.click();
      setValueTo('#team-modificator-event-0-off-input', '2');
      setValueTo('#team-modificator-event-0-in-input', '6');
      setValueTo('#team-modificator-event-0-thread-name-input', 'thread0');
      expect(getTeamModificator()).toMatchObject(
        new CustomTeamModificator([
          {
            off: 2,
            in: 6,
            threadName: 'thread0',
          },
        ]),
      );
    });

    test('Should bind custom team modificator with default values', () => {
      setSelectOption('team-modificator', 'custom');
      getAddEventButton()?.click();
      expect(getTeamModificator()).toMatchObject(
        new CustomTeamModificator([
          {
            off: 3,
            in: 5,
            threadName: '',
          },
        ]),
      );
    });

    test('Should display a button to add event', () => {
      setSelectOption('team-modificator', 'custom');
      expect(getAddEventButton()).not.toBeNull();
    });

    test('Should add a line on click of the button to add event', () => {
      setSelectOption('team-modificator', 'custom');
      getAddEventButton()?.click();
      expect(
        getTeamModificatorDivEvents()?.querySelectorAll<HTMLDivElement>('div')
          .length,
      ).toEqual(1);
    });

    test('Should display fields to add an event', () => {
      setSelectOption('team-modificator', 'custom');
      getAddEventButton()?.click();
      const divEvent = getTeamModificatorDivEvents();
      expect(
        divEvent?.querySelector('[for=team-modificator-event-0-in-input]'),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector('#team-modificator-event-0-in-input'),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector('[for=team-modificator-event-0-off-input]'),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector('#team-modificator-event-0-off-input'),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector(
          '[for=team-modificator-event-0-thread-name-input]',
        ),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector('#team-modificator-event-0-thread-name-input'),
      ).not.toBeNull();
    });

    test('Should add two lines to add an event', () => {
      setSelectOption('team-modificator', 'custom');
      getAddEventButton()?.click();
      getAddEventButton()?.click();
      const divEvent = getTeamModificatorDivEvents();
      divEvent?.querySelectorAll<HTMLDivElement>('div');
      expect(
        divEvent?.querySelector('#team-modificator-event-1-in-input'),
      ).not.toBeNull();
    });

    test('Should remove an event line', () => {
      setSelectOption('team-modificator', 'custom');
      getAddEventButton()?.click();
      const removeButton = getRemoveEventButton(0);
      removeButton?.click();
      expect(document.querySelector('#in-input-0')).toBeNull();
    });
  });

  describe('Bug generator', () => {
    const getAddEventButton = (): HTMLButtonElement | null =>
      document.querySelector<HTMLButtonElement>(
        '#bug-generator-add-event-button',
      );

    const getRemoveEventButton = (id: number): HTMLButtonElement | null =>
      document.querySelector<HTMLButtonElement>(
        `#bug-generator-remove-event-button-${id}`,
      );

    const getBugGeneratorDivEvents = (): HTMLDivElement | null =>
      document.querySelector<HTMLDivElement>('#bug-generator-events');

    test('Should create a no bug generator', () => {
      expect(getBugGenerator()).toEqual(noBugGenerator);
    });

    test('Should create a random bug generator', () => {
      setSelectOption('bug-generator', 'random');
      expect(getBugGenerator()).instanceof(RandomBugGenerator);
    });

    test('Should not propose bug generator events if not custom', () => {
      expect(getBugGeneratorDivEvents()?.style.display).toEqual('none');
    });

    test('Should create a custom bug generator', () => {
      setSelectOption('bug-generator', 'custom');
      expect(getBugGeneratorDivEvents()?.style.display).toEqual('block');
    });

    test('Should hide bug generator events when random is selected after custom', () => {
      setSelectOption('bug-generator', 'custom');
      setSelectOption('bug-generator', 'random');
      expect(getBugGeneratorDivEvents()?.style.display).toEqual('none');
    });

    test('Should propose custom bug generator', () => {
      setSelectOption('bug-generator', 'custom');
      expect(getBugGenerator()).instanceof(CustomBugGenerator);
    });

    test('Should bind custom bug generator', () => {
      setSelectOption('bug-generator', 'custom');
      getAddEventButton()?.click();
      setValueTo('#bug-generator-event-0-time-input', '2');
      setValueTo('#bug-generator-event-0-complexity-input', '6');
      setValueTo('#bug-generator-event-0-review-complexity-input', '3');
      setValueTo('#bug-generator-event-0-priority-input', '2');
      expect(getBugGenerator()).toMatchObject(
        new CustomBugGenerator([
          {
            time: 2,
            complexity: 6,
            reviewComplexity: 3,
            priority: 2,
          },
        ]),
      );
    });

    test('Should bind custom bug generator with default values', () => {
      setSelectOption('bug-generator', 'custom');
      getAddEventButton()?.click();
      expect(getBugGenerator()).toMatchObject(
        new CustomBugGenerator([
          {
            time: 3,
            complexity: 1,
            reviewComplexity: 1,
            priority: 0,
          },
        ]),
      );
    });

    test('Should display a button to add event', () => {
      setSelectOption('bug-generator', 'custom');
      expect(getAddEventButton()).not.toBeNull();
    });

    test('Should add a line on click of the button to add event', () => {
      setSelectOption('bug-generator', 'custom');
      getAddEventButton()?.click();
      expect(
        getBugGeneratorDivEvents()?.querySelectorAll<HTMLDivElement>('div')
          .length,
      ).toEqual(1);
    });

    test('Should display fields to add an event', () => {
      setSelectOption('bug-generator', 'custom');
      getAddEventButton()?.click();
      const divEvent = getBugGeneratorDivEvents();
      expect(
        divEvent?.querySelector('[for=bug-generator-event-0-complexity-input]'),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector('#bug-generator-event-0-complexity-input'),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector('[for=bug-generator-event-0-time-input]'),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector('#bug-generator-event-0-time-input'),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector(
          '[for=bug-generator-event-0-review-complexity-input]',
        ),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector(
          '#bug-generator-event-0-review-complexity-input',
        ),
      ).not.toBeNull();
    });

    test('Should add two lines to add an event', () => {
      setSelectOption('bug-generator', 'custom');
      getAddEventButton()?.click();
      getAddEventButton()?.click();
      const divEvent = getBugGeneratorDivEvents();
      divEvent?.querySelectorAll<HTMLDivElement>('div');
      expect(
        divEvent?.querySelector('#bug-generator-event-1-complexity-input'),
      ).not.toBeNull();
    });

    test('Should remove an event line', () => {
      setSelectOption('bug-generator', 'custom');
      getAddEventButton()?.click();
      const removeButton = getRemoveEventButton(0);
      removeButton?.click();
      expect(document.querySelector('#complexity-input-0')).toBeNull();
    });
  });

  describe('Priority modificator', () => {
    const getAddEventButton = (): HTMLButtonElement | null =>
      document.querySelector<HTMLButtonElement>(
        '#priority-modificator-add-event-button',
      );

    const getRemoveEventButton = (id: number): HTMLButtonElement | null =>
      document.querySelector<HTMLButtonElement>(
        `#priority-modificator-remove-event-button-${id}`,
      );

    const getPriorityModificatorDivEvents = (): HTMLDivElement | null =>
      document.querySelector<HTMLDivElement>('#priority-modificator-events');

    test('Should create a no priority modificator', () => {
      expect(getPriorityModificator()).toEqual(noPriorityModificator);
    });

    test('Should create a random priority modificator', () => {
      setSelectOption('priority-modificator', 'random');
      expect(getPriorityModificator()).instanceof(RandomPriorityModificator);
    });

    test('Should not propose priority modificator events if not custom', () => {
      expect(getPriorityModificatorDivEvents()?.style.display).toEqual('none');
    });

    test('Should create a custom priority modificator', () => {
      setSelectOption('priority-modificator', 'custom');
      expect(getPriorityModificatorDivEvents()?.style.display).toEqual('block');
    });

    test('Should hide priority modificator events when random is selected after custom', () => {
      setSelectOption('priority-modificator', 'custom');
      setSelectOption('priority-modificator', 'random');
      expect(getPriorityModificatorDivEvents()?.style.display).toEqual('none');
    });

    test('Should propose custom priority modificator', () => {
      setSelectOption('priority-modificator', 'custom');
      expect(getPriorityModificator()).instanceof(CustomPriorityModificator);
    });

    test('Should bind custom priority modificator', () => {
      setSelectOption('priority-modificator', 'custom');
      getAddEventButton()?.click();
      setValueTo('#priority-modificator-event-0-id-input', '6');
      setValueTo('#priority-modificator-event-0-priority-input', '3');
      setValueTo('#priority-modificator-event-0-time-input', '2');
      expect(getPriorityModificator()).toMatchObject(
        new CustomPriorityModificator([
          {
            time: 2,
            id: 6,
            priority: 3,
          },
        ]),
      );
    });

    test('Should bind custom priority modificator with default values', () => {
      setSelectOption('priority-modificator', 'custom');
      getAddEventButton()?.click();
      expect(getPriorityModificator()).toMatchObject(
        new CustomPriorityModificator([
          {
            time: 2,
            id: 0,
            priority: 3,
          },
        ]),
      );
    });

    test('Should display a button to add event', () => {
      setSelectOption('priority-modificator', 'custom');
      expect(getAddEventButton()).not.toBeNull();
    });

    test('Should add a line on click of the button to add event', () => {
      setSelectOption('priority-modificator', 'custom');
      getAddEventButton()?.click();
      expect(
        getPriorityModificatorDivEvents()?.querySelectorAll<HTMLDivElement>(
          'div',
        ).length,
      ).toEqual(1);
    });

    test('Should display fields to add an event', () => {
      setSelectOption('priority-modificator', 'custom');
      getAddEventButton()?.click();
      const divEvent = getPriorityModificatorDivEvents();
      expect(
        divEvent?.querySelector('[for=priority-modificator-event-0-id-input]'),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector('#priority-modificator-event-0-id-input'),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector(
          '[for=priority-modificator-event-0-time-input]',
        ),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector('#priority-modificator-event-0-time-input'),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector(
          '[for=priority-modificator-event-0-priority-input]',
        ),
      ).not.toBeNull();
      expect(
        divEvent?.querySelector('#priority-modificator-event-0-priority-input'),
      ).not.toBeNull();
    });

    test('Should add two lines to add an event', () => {
      setSelectOption('priority-modificator', 'custom');
      getAddEventButton()?.click();
      getAddEventButton()?.click();
      const divEvent = getPriorityModificatorDivEvents();
      divEvent?.querySelectorAll<HTMLDivElement>('div');
      expect(
        divEvent?.querySelector('#priority-modificator-event-1-time-input'),
      ).not.toBeNull();
    });

    test('Should remove an event line', () => {
      setSelectOption('priority-modificator', 'custom');
      getAddEventButton()?.click();
      const removeButton = getRemoveEventButton(0);
      removeButton?.click();
      expect(document.querySelector('#time-input-0')).toBeNull();
    });
  });
});
