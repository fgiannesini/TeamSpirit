import './style.scss';
import { render } from './render.ts';
import { State } from './user-story.ts';

render([
  {
    time: 1,
    userStoryName: 'userStory1',
    thread: 0,
    state: State.IN_PROGRESS,
  },
  {
    time: 1,
    userStoryName: 'userStory2',
    thread: 1,
    state: State.IN_PROGRESS,
  },
  {
    time: 1,
    userStoryName: 'userStory2',
    thread: 1,
    state: State.DONE,
  },
  {
    time: 2,
    userStoryName: 'userStory1',
    thread: 0,
    state: State.DONE,
  },
  {
    time: 2,
    userStoryName: 'idle',
    thread: 1,
    state: State.DONE,
  },
]);
