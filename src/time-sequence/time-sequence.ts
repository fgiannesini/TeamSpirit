import { loadTimeEvents } from '../flow/storage/session-storage.ts';
import { TimeEvent } from '../simulate/events.ts';
import { State } from '../simulate/user-story.ts';

const createUserStory = (id: string) => {
  const userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = id;
  userStoryHtmlElement.className = 'user-story';
  return userStoryHtmlElement;
};

const addUserStory = (parent: Element, events: TimeEvent[]) => {
  const userStoryNames = Array.from(
    new Set(events.map((event) => event.userStoryName)),
  );
  userStoryNames
    .filter((userStoryName) => userStoryName !== 'idle')
    .map((userStoryName) => createUserStory(userStoryName))
    .forEach((userStoryElement) => {
      parent.appendChild(userStoryElement);
    });
};

const timeSequenceElement = (className: string) => {
  const timeSequenceElement = document.createElement('div');
  timeSequenceElement.className = className;
  return timeSequenceElement;
};

const renderTimeSequence = (timeEvents: TimeEvent[]) => {
  const parent = document.querySelector('#user-stories');
  if (!parent) {
    return;
  }
  addUserStory(parent, timeEvents);

  for (const timeEvent of timeEvents) {
    const userStory = document.querySelector('#' + timeEvent.userStoryName);
    if (timeEvent.state == State.IN_PROGRESS) {
      userStory?.appendChild(timeSequenceElement('vertical'));
      userStory?.appendChild(timeSequenceElement('horizontal-top'));
    }
    if (timeEvent.state == State.DONE) {
      userStory?.appendChild(timeSequenceElement('vertical'));
    }
  }
};
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
if (id) {
  renderTimeSequence(loadTimeEvents(id));
}
