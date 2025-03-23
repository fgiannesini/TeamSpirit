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

  const userStoriesSequence = new Map<string, string[]>(
    userStoryNames.map((str) => [str, []]),
  );
  while (maxTime !== time) {
    time++;
    const currentEvents = timeEvents.filter((event) => event.time == time);
    for (const event of currentEvents) {
      const state = event.state;
      if (state == State.IN_PROGRESS || state == State.REVIEW) {
        const sequence = userStoriesSequence.get(event.userStoryName) ?? [];
        sequence.push('vertical');
        sequence.push('horizontal-top');
        sequence.push('vertical');
      }
    }
    userStoriesSequence.forEach((sequences) => {
      const length = sequences.filter((sequence) =>
        sequence.startsWith('horizontal'),
      ).length;
      for (let i = 0; i < time - length; i++) {
        sequences.push('horizontal-bottom');
      }
    });
  }
  const newUserStoriesSequence = new Map<string, string[]>();
  userStoriesSequence.forEach((values, key) =>
    newUserStoriesSequence.set(
      key,
      values.filter(
        (value, index, array) =>
          !(value === 'vertical' && array[index - 1] === 'vertical') &&
          !(value === 'vertical' && array[index + 1] === 'vertical'),
      ),
    ),
  );
  newUserStoriesSequence.forEach((sequences, userStoryName) => {
    const userStory = document.querySelector(`#${userStoryName}`);
    if (!userStory) return;
    sequences.forEach((element) => {
      userStory.appendChild(timeSequenceElement(element));
    });
  });
};

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
if (id) {
  renderTimeSequence(loadTimeEvents(id));
}
