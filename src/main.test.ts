import { beforeEach, describe, expect, test, vi } from 'vitest';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { TimeEvent } from './simulate/events.ts';
import { Backlog } from './simulate/backlog.ts';
import { buildBacklog, buildTeam } from './main.ts';
import { State } from './simulate/user-story.ts';
import { EnsembleTeam, ParallelTeam } from './simulate/team.ts';
import { noReview } from './simulate/review.ts';
import { StatEvent } from './simulate/stats.ts';
import { UUID } from 'node:crypto';

describe('Main', () => {
  beforeEach(async () => {
    vi.spyOn(window, 'open').mockImplementation(vi.fn());
    const htmlPath = resolve(__dirname, './index.html');
    document.body.innerHTML = readFileSync(htmlPath, 'utf-8');
    await import('./main.ts');
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  const setValueTo = (selectors: string, value: string) => {
    const taskCountInput = document.querySelector<HTMLInputElement>(selectors);
    if (taskCountInput) {
      taskCountInput.value = value;
    }
  };
  const clickOn = (buttonId: string) => {
    document.querySelector<HTMLButtonElement>(buttonId)?.click();
  };

  const select = (selectId: string, optionValue: string) => {
    const select = document.querySelector<HTMLSelectElement>(selectId);
    const option = select?.querySelector<HTMLOptionElement>(
      `option[value="${optionValue}"]`,
    );
    if (option) {
      option.selected = true;
    }
  };

  test('Should compute and store in sessionStorage', () => {
    crypto.randomUUID = (): UUID => 'e4567-e89b-12d3-a456-426614174000';
    setValueTo('#user-story-count-input', '1');
    setValueTo('#dev-count-input', '2');
    clickOn('#generate-devs-button');

    setValueTo('#reviewers-input', '');
    clickOn('#calculate-button');

    const timeEvents = JSON.parse(
      sessionStorage.getItem('computation-e4567-e89b-12d3-a456-426614174000') ??
        '[]',
    ) as TimeEvent[];
    expect(timeEvents.length).greaterThan(0);

    const statEvents = JSON.parse(
      sessionStorage.getItem('stats-e4567-e89b-12d3-a456-426614174000') ?? '[]',
    ) as StatEvent[];
    expect(statEvents.length).greaterThan(0);
  });

  test('Should build the backlog without reviewers', () => {
    setValueTo('#user-story-count-input', '2');
    clickOn('#generate-user-stories-button');
    expect(buildBacklog()).toEqual(
      Backlog.init()
        .addUserStory({
          name: `US0`,
          complexity: 5,
          review: noReview,
          reviewComplexity: 2,
          state: State.TODO,
          thread: undefined,
          progression: 0,
        })
        .addUserStory({
          name: `US1`,
          complexity: 5,
          review: noReview,
          reviewComplexity: 2,
          state: State.TODO,
          thread: undefined,
          progression: 0,
        })
        .build(),
    );
  });

  test('Should build the backlog with reviewers', () => {
    setValueTo('#user-story-count-input', '1');
    clickOn('#generate-user-stories-button');
    setValueTo('#reviewers-input', '1');

    expect(buildBacklog()).toEqual(
      Backlog.init()
        .addUserStory({
          name: `US0`,
          complexity: 5,
          review: {
            reviewersNeeded: 1,
            reviewers: new Map<number, number>(),
          },
          reviewComplexity: 2,
          state: State.TODO,
          thread: undefined,
          progression: 0,
        })
        .build(),
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
    select('#team-type-select', 'parallel');
    expect(buildTeam()).toStrictEqual(
      new ParallelTeam([
        { id: 0, power: 5 },
        { id: 1, power: 10 },
      ]),
    );
  });

  test('Should build an ensemble team with 2 developers', () => {
    setValueTo('#dev-count-input', '2');
    clickOn('#generate-devs-button');
    setValueTo('#power-input-0', '5');
    setValueTo('#power-input-1', '10');
    select('#team-type-select', 'ensemble');
    expect(buildTeam()).toStrictEqual(
      new EnsembleTeam([
        { id: 0, power: 5 },
        { id: 1, power: 10 },
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

  test('Should build the backlog with 2 user stories', () => {
    setValueTo('#user-story-count-input', '2');
    clickOn('#generate-user-stories-button');
    setValueTo('#complexity-input-0', '2');
    setValueTo('#review-complexity-input-0', '1');
    setValueTo('#complexity-input-1', '4');
    setValueTo('#review-complexity-input-1', '2');
    expect(buildBacklog()).toEqual(
      Backlog.init()
        .addUserStory({
          name: `US0`,
          complexity: 2,
          review: noReview,
          reviewComplexity: 1,
          state: State.TODO,
          thread: undefined,
          progression: 0,
        })
        .addUserStory({
          name: `US1`,
          complexity: 4,
          review: noReview,
          reviewComplexity: 2,
          state: State.TODO,
          thread: undefined,
          progression: 0,
        })
        .build(),
    );
  });
});
