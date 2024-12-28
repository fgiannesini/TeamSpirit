import './style.scss';
import { render } from './render/render.ts';
import { State } from './compute/user-story.ts';

render([
  {
    time: 1,
    userStoryName: 'userStory1',
    thread: 0,
    state: State.IN_PROGRESS,
  },
  {
    time: 1,
    userStoryName: 'userStory1',
    thread: 0,
    state: State.TO_REVIEW,
  },
  {
    time: 1,
    userStoryName: 'idle',
    thread: 1,
    state: State.DONE,
  },
  {
    time: 2,
    userStoryName: 'idle',
    thread: 0,
    state: State.DONE,
  },
  {
    time: 2,
    userStoryName: 'userStory1',
    thread: 1,
    state: State.REVIEW,
  },
  {
    time: 2,
    userStoryName: 'userStory1',
    thread: 1,
    state: State.DONE,
  },
]);
