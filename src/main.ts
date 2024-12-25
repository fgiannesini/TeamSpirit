import './style.scss';
import { render } from './render.ts';
import { State } from './task.ts';

render([
  {
    time: 1,
    taskName: 'task1',
    thread: 0,
    previousState: State.TODO,
    newState: State.IN_PROGRESS,
  },
  {
    time: 1,
    taskName: 'task2',
    thread: 1,
    previousState: State.TODO,
    newState: State.IN_PROGRESS,
  },
  {
    time: 1,
    taskName: 'task2',
    thread: 1,
    previousState: State.IN_PROGRESS,
    newState: State.DONE,
  },
  {
    time: 2,
    taskName: 'task1',
    thread: 0,
    previousState: State.IN_PROGRESS,
    newState: State.DONE,
  },
  {
    time: 2,
    taskName: 'idle',
    thread: 1,
    previousState: State.DONE,
    newState: State.DONE,
  },
]);
