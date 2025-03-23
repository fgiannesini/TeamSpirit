import './time-sequence.scss';
import { loadTimeEvents } from '../flow/storage/session-storage.ts';
import { TimeEvent } from '../simulate/events.ts';
import { State } from '../simulate/user-story.ts';

const createUserStory = (id: string) => {
  const userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = id;
  userStoryHtmlElement.className = 'user-story';

  const userStoryTitle = document.createElement('span');
  userStoryTitle.textContent = id;
  userStoryTitle.className = 'user-story-title';
  userStoryHtmlElement.appendChild(userStoryTitle);

  return userStoryHtmlElement;
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
  const userStoryNames = Array.from(
    new Set(timeEvents.map((event) => event.userStoryName)),
  );
  userStoryNames
    .filter((userStoryName) => userStoryName !== 'idle')
    .map((userStoryName) => createUserStory(userStoryName))
    .forEach((userStoryElement) => {
      parent.appendChild(userStoryElement);
    });

  const maxTime = Math.max(...timeEvents.map((event) => event.time));
  let time = 0;

  const userStoriesState = new Map(userStoryNames.map((str) => [str, false]));
  while (maxTime !== time) {
    time++;
    const currentEvents = timeEvents.filter((event) => event.time == time);
    for (const userStoryName of userStoryNames) {
      const userStory = document.querySelector(`#${userStoryName}`);
      if (!userStory) continue;

      const state = currentEvents.findLast(
        (event) => event.userStoryName === userStoryName,
      )?.state;
      if (!state) {
        userStory.appendChild(timeSequenceElement('horizontal-bottom'));
      }
      if (state == State.DONE || state == State.TO_REVIEW) {
        userStory.appendChild(timeSequenceElement('vertical'));
        userStory.appendChild(timeSequenceElement('horizontal-top'));
        userStory.appendChild(timeSequenceElement('vertical'));
      }
      if (state == State.IN_PROGRESS || state == State.REVIEW) {
        if (!userStoriesState.get(userStoryName)) {
          userStory.appendChild(timeSequenceElement('vertical'));
          userStoriesState.set(userStoryName, true);
        }
        userStory.appendChild(timeSequenceElement('horizontal-top'));
      }
    }
  }
};
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
if (id) {
  renderTimeSequence(loadTimeEvents(id));
}
