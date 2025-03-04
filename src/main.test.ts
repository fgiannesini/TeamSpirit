import { beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('Should compute and store in sessionStorage', () => {
    const taskCountInput =
      document.querySelector<HTMLInputElement>('#task-count-input')!;
    taskCountInput.value = '1';
    const devCountInput =
      document.querySelector<HTMLInputElement>('#dev-count-input')!;
    devCountInput.value = '2';
    const reviewCheckbox =
      document.querySelector<HTMLInputElement>('#reviewers-input')!;
    reviewCheckbox.value = '';
    const calculateButton =
      document.querySelector<HTMLButtonElement>('#calculate-button')!;
    calculateButton.click();

    const timeEvents = JSON.parse(
      sessionStorage.getItem('computation')!
    ) as Array<TimeEvent>;
    expect(timeEvents.length).greaterThan(0);

    const statEvents = JSON.parse(
      sessionStorage.getItem('stats')!
    ) as Array<StatEvent>;
    expect(statEvents.length).greaterThan(0);
  });

  it('Should build the backlog without review', () => {
    document.querySelector<HTMLInputElement>('#task-count-input')!.value = '1';
    expect(buildBacklog()).toEqual(
      Backlog.init()
        .addUserStory({
          name: `US0`,
          complexity: 1,
          review: noReview,
          reviewComplexity: 1,
          state: State.TODO,
          thread: -1,
          progression: 0,
        })
        .build()
    );
  });

  it('Should build the backlog with reviewers', () => {
    document.querySelector<HTMLInputElement>('#task-count-input')!.value = '1';
    document.querySelector<HTMLInputElement>('#reviewers-input')!.value = '1';

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
          thread: -1,
          progression: 0,
        })
        .build()
    );
  });

  it.each(['1', '2'])(
    'Should build the team with %s reviewers',
    (reviewersInput) => {
      document.querySelector<HTMLInputElement>('#dev-count-input')!.value = '2';
      document.querySelector<HTMLInputElement>('#reviewers-input')!.value =
        reviewersInput;
      expect(buildParallelTeam()).toEqual(
        ParallelTeam.init().withDevCount(2).withReview(true).build()
      );
    }
  );

  it.each(['0', '', ' '])(
    'Should build the team without reviewers (value %s)',
    (reviewersInput) => {
      document.querySelector<HTMLInputElement>('#dev-count-input')!.value = '2';
      document.querySelector<HTMLInputElement>('#reviewers-input')!.value =
        reviewersInput;
      expect(buildParallelTeam()).toEqual(
        ParallelTeam.init().withDevCount(2).withReview(false).build()
      );
    }
  );
});
