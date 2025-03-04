import './flow.scss';
import { render } from './render.ts';
import { loadStatEvents, loadTimeEvents } from './session-storage.ts';

const timeEvents = loadTimeEvents();
const statEvents = loadStatEvents();
render(timeEvents, statEvents);
