import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  buildBacklogForEnsembleTeam,
  buildBacklogForParallelTeam,
  buildEnsembleTeam,
  buildParallelTeam,
} from './main.ts';
import { Backlog } from './simulate/backlog.ts';
import type { TimeEvent } from './simulate/events.ts';
import { createThread, todo } from './simulate/factory.ts';
import { noReview } from './simulate/review.ts';
import type { StructureEvent } from './simulate/simulation-structure.ts';
import type { StatEvent } from './simulate/stats.ts';
import { EnsembleTeam, ParallelTeam } from './simulate/team.ts';

describe('Main', () => {
  beforeEach(async () => {
    vi.spyOn(window, 'open').mockImplementation(vi.fn());
    const htmlPath = resolve(__dirname, './index.html');
    document.body.innerHTML = readFileSync(htmlPath, 'utf-8');
    await import('./main.ts');
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

  test('Should compute and store time events in sessionStorage', () => {
    const randomUuidSpy = vi.spyOn(crypto, 'randomUUID');
    randomUuidSpy
      .mockReturnValueOnce('e4567-e89b-12d3-a456-426614174000')
      .mockReturnValueOnce('e4567-e89b-12d3-a456-426614174001');

    setValueTo('#user-story-count-input', '1');
    setValueTo('#dev-count-input', '2');
    clickOn('#generate-devs-button');

    setValueTo('#reviewers-input', '');
    clickOn('#calculate-button');

    const timeEventsForParallelTeam = JSON.parse(
      sessionStorage.getItem('computation-e4567-e89b-12d3-a456-426614174000') ??
        '[]',
    ) as TimeEvent[];
    expect(timeEventsForParallelTeam.length).greaterThan(0);

    const timeEventsForEnsembleTeam = JSON.parse(
      sessionStorage.getItem('computation-e4567-e89b-12d3-a456-426614174001') ??
        '[]',
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
      sessionStorage.getItem('stats-e4567-e89b-12d3-a456-426614174000') ?? '[]',
    ) as StatEvent[];
    expect(statEventsForParallelTeam.length).greaterThan(0);

    const statEventsForEnsembleTeam = JSON.parse(
      sessionStorage.getItem('stats-e4567-e89b-12d3-a456-426614174001') ?? '[]',
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
      sessionStorage.getItem('stats-e4567-e89b-12d3-a456-426614174001') ?? '[]',
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

  test('Should build the backlog for ensemble team', () => {
    setValueTo('#user-story-count-input', '2');
    clickOn('#generate-user-stories-button');
    setValueTo('#reviewers-input', '1');

    expect(buildBacklogForEnsembleTeam()).toEqual(
      new Backlog([
        todo({
          id: 0,
          name: 'US0',
          complexity: 5,
          review: noReview,
        }),
        todo({
          id: 1,
          name: 'US1',
          complexity: 5,
          review: noReview,
        }),
      ]),
    );
  });

  test('Should build the backlog for parallel team with reviewers', () => {
    setValueTo('#user-story-count-input', '1');
    clickOn('#generate-user-stories-button');
    setValueTo('#reviewers-input', '1');

    expect(buildBacklogForParallelTeam()).toEqual(
      new Backlog([
        todo({
          id: 0,
          name: 'US0',
          complexity: 5,
          review: {
            reviewComplexity: 2,
            reviewersNeeded: 1,
            reviewers: new Map<number, number>(),
          },
        }),
      ]),
    );
  });

  test('Should build the backlog for parallel team without reviewers', () => {
    setValueTo('#user-story-count-input', '1');
    clickOn('#generate-user-stories-button');

    expect(buildBacklogForParallelTeam()).toEqual(
      new Backlog([
        todo({
          id: 0,
          name: 'US0',
          complexity: 5,
          review: {
            reviewComplexity: 2,
            reviewersNeeded: 0,
            reviewers: new Map<number, number>(),
          },
        }),
      ]),
    );
  });

  test('Should generate developers', () => {
    setValueTo('#dev-count-input', '2');
    clickOn('#generate-devs-button');
    const devs = Array.from(document.querySelectorAll('#devs-container div'));
    expect(devs.length).toEqual(2);
    expect(
      document.querySelector('#devs-container #dev-identifier-0')?.textContent,
    ).toEqual('0');
    expect(
      document.querySelector<HTMLInputElement>('#devs-container #power-input-0')
        ?.value,
    ).toEqual('1');
    expect(
      document.querySelector('#devs-container #dev-identifier-1')?.textContent,
    ).toEqual('1');
    expect(
      document.querySelector<HTMLInputElement>('#devs-container #power-input-1')
        ?.value,
    ).toEqual('1');
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
      new ParallelTeam([
        createThread({ id: 0, name: 'thread0', power: 5 }),
        createThread({ id: 1, name: 'thread1', power: 10 }),
      ]),
    );
  });

  test('Should build a default parallel team', () => {
    setValueTo('#dev-count-input', '2');
    expect(buildParallelTeam()).toStrictEqual(
      new ParallelTeam([
        createThread({ id: 0, name: 'thread0', power: 1 }),
        createThread({ id: 1, name: 'thread1', power: 1 }),
      ]),
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

  test('Should generate user stories', () => {
    setValueTo('#user-story-count-input', '2');
    clickOn('#generate-user-stories-button');
    const userStories = Array.from(
      document.querySelectorAll('#user-stories-container div'),
    );
    expect(userStories.length).toEqual(2);
    expect(
      document.querySelector('#user-stories-container #user-story-identifier-0')
        ?.textContent,
    ).toEqual('0');
    expect(
      document.querySelector<HTMLInputElement>(
        '#user-stories-container #complexity-input-0',
      )?.value,
    ).toEqual('5');
    expect(
      document.querySelector<HTMLInputElement>(
        '#user-stories-container #review-complexity-input-0',
      )?.value,
    ).toEqual('2');
    expect(
      document.querySelector('#user-stories-container #user-story-identifier-1')
        ?.textContent,
    ).toEqual('1');
    expect(
      document.querySelector<HTMLInputElement>(
        '#user-stories-container #complexity-input-1',
      )?.value,
    ).toEqual('5');
    expect(
      document.querySelector<HTMLInputElement>(
        '#user-stories-container #review-complexity-input-1',
      )?.value,
    ).toEqual('2');
  });

  test('Should build the backlog for ensemble team with 2 user stories', () => {
    setValueTo('#user-story-count-input', '2');
    clickOn('#generate-user-stories-button');
    setValueTo('#complexity-input-0', '2');
    setValueTo('#review-complexity-input-0', '1');
    setValueTo('#complexity-input-1', '4');
    setValueTo('#review-complexity-input-1', '2');
    expect(buildBacklogForEnsembleTeam()).toEqual(
      new Backlog([
        todo({
          id: 0,
          name: 'US0',
          complexity: 2,
          review: noReview,
        }),
        todo({
          id: 1,
          name: 'US1',
          complexity: 4,
          review: noReview,
        }),
      ]),
    );
  });
});
