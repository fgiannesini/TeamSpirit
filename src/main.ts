import './style.scss';
import { render } from './render.ts';

render([
  { time: 1, taskName: 'task1', thread: 0 },
  { time: 1, taskName: 'task2', thread: 1 },
  { time: 2, taskName: 'task3', thread: 0 },
  { time: 2, taskName: 'idle', thread: 1 },
]);
