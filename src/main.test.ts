import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { TimeEvent } from './compute/events.ts';
import { Backlog } from './compute/backlog.ts';
import { buildBacklog, buildParallelTeam } from './main.ts';
import { State } from './compute/user-story.ts';
import { ParallelTeam } from './compute/team.ts';
import {noReview} from "./compute/review.ts";

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
      document.querySelector<HTMLInputElement>('#review-checkbox')!;
    reviewCheckbox.checked = true;
    const calculateButton =
      document.querySelector<HTMLButtonElement>('#calculate-button')!;
    calculateButton.click();
    const actual = JSON.parse(
      sessionStorage.getItem('computation')!
    ) as Array<TimeEvent>;
    expect(actual.length).greaterThan(0);
  });

  it('Should build the backlog', () => {
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

  it('Should build the team', () => {
    document.querySelector<HTMLInputElement>('#dev-count-input')!.value = '2';
    document.querySelector<HTMLInputElement>('#review-checkbox')!.checked =
      true;
    expect(buildParallelTeam()).toEqual(
      ParallelTeam.init().withDevCount(2).withReview(true).build()
    );
  });
});
