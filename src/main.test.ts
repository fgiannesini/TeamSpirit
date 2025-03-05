import { beforeEach, describe, expect, test, vi } from 'vitest';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { TimeEvent } from './compute/events.ts';
import { Backlog } from './compute/backlog.ts';
import { buildBacklog, buildParallelTeam } from './main.ts';
import { State } from './compute/user-story.ts';
import { Team } from './compute/team.ts';
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
    const button = document.querySelector<HTMLButtonElement>(buttonId);
    if (button) button.click();
  };

  test('Should compute and store in sessionStorage', () => {
    setValueTo('#task-count-input', '1');
    setValueTo('#dev-count-input', '2');
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

  test('Should build the backlog without review', () => {
    setValueTo('#task-count-input', '2');
    expect(buildBacklog()).toEqual(
      Backlog.init()
        .addUserStory({
          name: `US0`,
          complexity: 1,
          review: noReview,
          reviewComplexity: 1,
          state: State.TODO,
          thread: undefined,
          progression: 0,
        })
        .addUserStory({
          name: `US1`,
          complexity: 1,
          review: noReview,
          reviewComplexity: 1,
          state: State.TODO,
          thread: undefined,
          progression: 0,
        })
        .build(),
    );
  });

  test('Should build the backlog with reviewers', () => {
    setValueTo('#task-count-input', '1');
    setValueTo('#reviewers-input', '1');

    expect(buildBacklog()).toEqual(
      Backlog.init()
        .addUserStory({
          name: `US0`,
          complexity: 1,
          review: {
            reviewersNeeded: 1,
            reviewers: new Map<number, number>(),
          },
          reviewComplexity: 1,
          state: State.TODO,
          thread: undefined,
          progression: 0,
        })
        .build(),
    );
  });

  test.each(['1', '2'])(
    'Should build the team with %s reviewers',
    (reviewersInput) => {
      setValueTo('#dev-count-input', '2');
      setValueTo('#reviewers-input', reviewersInput);
      expect(buildParallelTeam()).toEqual(
        Team.parallelTeam().withDevCount(2).withReview(true).build(),
      );
    },
  );

  test.each(['0', '', ' '])(
    'Should build the team without reviewers (value %s)',
    (reviewersInput) => {
      setValueTo('#dev-count-input', '2');
      setValueTo('#reviewers-input', reviewersInput);
      expect(buildParallelTeam()).toEqual(
        Team.parallelTeam().withDevCount(2).withReview(false).build(),
      );
    },
  );

  test('Should generate developers', () => {
    setValueTo('#dev-count-input', '2');
    clickOn('#generate-devs-button');
    const devs = Array.from(document.querySelectorAll('#devs-container div'));
    expect(devs.length).toEqual(2);
  });

  test('Should generate developers once', () => {
    setValueTo('#dev-count-input', '2');
    clickOn('#generate-devs-button');
    clickOn('#generate-devs-button');
    const devs = Array.from(document.querySelectorAll('#devs-container div'));
    expect(devs.length).toEqual(2);
  });
});
