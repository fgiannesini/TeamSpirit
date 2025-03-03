import './style.scss';
import { ParallelTeam } from './compute/team.ts';
import { Backlog } from './compute/backlog.ts';
import { State } from './compute/user-story.ts';
import { saveTimeEvents } from './flow/session-storage.ts';

const createUserStory = (i: number, reviewersCount: number) => ({
  name: `US${i}`,
  complexity: 1,
  review: {
    reviewersNeeded: reviewersCount,
    reviewers: new Map<number, number>(),
  },
  reviewComplexity: 1,
  state: State.TODO,
  thread: -1,
  progression: 0,
});

export const buildBacklog = () => {
  const taskCount = parseInt(
    document.querySelector<HTMLInputElement>('#task-count-input')!.value
  );
  const reviewersCount =
    document.querySelector<HTMLInputElement>('#reviewers-input')!.value;
  const backlogBuilder = Backlog.init();
  Array.from({ length: taskCount }, (_, i) =>
    backlogBuilder.addUserStory(createUserStory(i, Number(reviewersCount)))
  );
  return backlogBuilder.build();
};

export const buildParallelTeam = () => {
  const devCount = parseInt(
    document.querySelector<HTMLInputElement>('#dev-count-input')!.value
  );
  const reviewersCount =
    document.querySelector<HTMLInputElement>('#reviewers-input')!.value;
  const hasReview = !!reviewersCount && Number(reviewersCount) > 0;
  return ParallelTeam.init()
    .withDevCount(devCount)
    .withReview(hasReview)
    .build();
};

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelector<HTMLButtonElement>('#calculate-button')!
    .addEventListener('click', () => {
      const backlog = buildBacklog();
      const parallelTeam = buildParallelTeam();
      const timeEvents = parallelTeam.run(backlog);
      saveTimeEvents(timeEvents);
      window.location.href = '/TeamSpirit/flow/flow.html';
    });
});
