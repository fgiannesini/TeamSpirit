import './style.scss';
import { render } from './render.ts';

render(document, [
  { time: 0, taskName: 'task1', thread: 0 },
  { time: 0, taskName: 'task2', thread: 1 },
  { time: 1, taskName: 'task3', thread: 0 },
  { time: 1, taskName: 'idle', thread: 1 },
]);
