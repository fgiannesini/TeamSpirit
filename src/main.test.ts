import { beforeEach, describe, expect, test, vi } from 'vitest';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { TimeEvent } from './compute/events.ts';
import { Backlog } from './compute/backlog.ts';
import { buildBacklog, buildParallelTeam } from './main.ts';
import { State } from './compute/user-story.ts';
import { ParallelTeam } from './compute/team.ts';
import { noReview } from './compute/review.ts';
import { StatEvent } from './compute/stats.ts';

describe('Main', () => {
  beforeEach(async () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      assign: vi.fn(),
      href: '',
    } as unknown as Location);
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

  test('Should compute and store in sessionStorage', () => {
    setValueTo('#user-story-count-input', '1');
    setValueTo('#dev-count-input', '2');
    clickOn('#generate-devs-button');

    setValueTo('#reviewers-input', '');
    clickOn('#calculate-button');

    const timeEvents = JSON.parse(
      sessionStorage.getItem('computation') ?? '[]',
    ) as TimeEvent[];
    expect(timeEvents.length).greaterThan(0);

    const statEvents = JSON.parse(
      sessionStorage.getItem('stats') ?? '[]',
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

  test('Should build the team with 2 developers', () => {
    setValueTo('#dev-count-input', '2');
    clickOn('#generate-devs-button');
    setValueTo('#power-input-0', '5');
    setValueTo('#power-input-1', '10');
    setValueTo('#user-story-count-input', '3');
    expect(buildParallelTeam()).toEqual(
      new ParallelTeam([
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
