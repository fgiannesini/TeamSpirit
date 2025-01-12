import './flow.scss';
import { render } from './render.ts';
import { loadTimeEvents } from './session-storage.ts';

const events = loadTimeEvents();
render(events);
