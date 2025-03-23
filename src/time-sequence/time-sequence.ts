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

const generateSequences = (
  timeEvents: TimeEvent[],
  userStoryNames: string[],
) => {
  const userStoriesSequence = new Map<string, string[]>(
    userStoryNames.map((str) => [str, []]),
  );

  const maxTime = Math.max(...timeEvents.map((event) => event.time));
  let time = 0;
  while (maxTime !== time) {
    time++;
    const currentEvents = timeEvents.filter((event) => event.time == time);
    currentEvents.forEach((event) => {
      if (event.state === State.IN_PROGRESS || event.state === State.REVIEW) {
        const sequence = userStoriesSequence.get(event.userStoryName);
        if (!sequence) return;
        sequence.push('vertical', 'horizontal-top', 'vertical');
      }
    });
    userStoriesSequence.forEach((sequences) => {
      const horizontalCount = sequences.filter((s) =>
        s.startsWith('horizontal'),
      ).length;
      const missingBottoms = time - horizontalCount;
      sequences.push(...Array(missingBottoms).fill('horizontal-bottom'));
    });
  }
  return userStoriesSequence;
};

function hasTwoConsecutiveVertical(
  sequenceElement: string,
  sequence: string[],
  index: number,
) {
  return (
    sequenceElement === 'vertical' &&
    (sequence[index - 1] === 'vertical' || sequence[index + 1] === 'vertical')
  );
}

const cleanConsecutiveVerticals = (
  userStoriesSequence: Map<string, string[]>,
) => {
  const newUserStoriesSequence = new Map<string, string[]>();
  userStoriesSequence.forEach((values, key) => {
    newUserStoriesSequence.set(
      key,
      values.filter(
        (sequenceElement, index, sequence) =>
          !hasTwoConsecutiveVertical(sequenceElement, sequence, index),
      ),
    );
  });
  return newUserStoriesSequence;
};

const addSequencesToDom = (
  cleanedUserStoriesSequence: Map<string, string[]>,
) => {
  cleanedUserStoriesSequence.forEach((sequences, userStoryName) => {
    const userStory = document.querySelector(`#${userStoryName}`);
    if (!userStory) return;
    sequences.forEach((element) =>
      userStory.appendChild(timeSequenceElement(element)),
    );
  });
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
  const userStoriesSequence = generateSequences(timeEvents, userStoryNames);
  const cleanedUserStoriesSequence =
    cleanConsecutiveVerticals(userStoriesSequence);
  addSequencesToDom(cleanedUserStoriesSequence);
};

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
if (id) {
  renderTimeSequence(loadTimeEvents(id));
}
