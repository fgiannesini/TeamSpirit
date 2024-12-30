import './flow.scss';
import { render } from './render.ts';
import { TimeEvent } from '../compute/events.ts';

const events = JSON.parse(
  sessionStorage.getItem('computation')!
) as TimeEvent[];
render(events);
