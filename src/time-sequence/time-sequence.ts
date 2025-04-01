import './time-sequence.scss';
import { loadTimeEvents } from '../flow/storage/session-storage.ts';
import type { TimeEvent } from '../simulate/events.ts';
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

const getDeduplicatesEventsStates = (currentEvents: TimeEvent[]) => {
  const values = currentEvents
    .reduce<Map<string, { userStoryName: string; state: State }>>(
      (acc, { userStoryName, state }) => {
        const key = `${userStoryName}_${state}`;
        acc.set(key, { userStoryName, state });
        return acc;
      },
      new Map(),
    )
    .values();
  return Array.from(values);
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
    const currentEvents = timeEvents.filter((event) => event.time === time);
    const eventStates = getDeduplicatesEventsStates(currentEvents);
    eventStates.forEach(({ userStoryName, state }) => {
      if (state === State.InProgress || state === State.Review) {
        const sequence = userStoriesSequence.get(userStoryName);
        if (!sequence) {
          return;
        }
        sequence.push('vertical', 'horizontal-top', 'vertical');
      }
    });
    userStoriesSequence.forEach((sequences) => {
      const horizontalCount = sequences.filter((s) =>
        s.startsWith('horizontal'),
      ).length;
      const missingBottoms = time - horizontalCount;
      sequences.push(
        ...Array.from({ length: missingBottoms }).flatMap(() => [
          'vertical-dashed',
          'horizontal-bottom',
          'vertical-dashed',
        ]),
      );
    });
  }
  return userStoriesSequence;
};

const cleanConsecutiveVerticals = (
  userStoriesSequence: Map<string, string[]>,
) => {
  const newUserStoriesSequence = new Map<string, string[]>();

  userStoriesSequence.forEach((values, key) => {
    const transformedList: string[] = [];
    for (let i = 0; i < values.length; i++) {
      if (values[i] === 'vertical' && values[i + 1] === 'vertical') {
        transformedList.push('vertical-dashed');
        i++;
      } else if (
        values[i] === 'vertical-dashed' &&
        values[i + 1] === 'vertical-dashed'
      ) {
        transformedList.push('vertical-dashed');
        i++;
      } else if (
        (values[i] === 'vertical' && values[i + 1] === 'vertical-dashed') ||
        (values[i] === 'vertical-dashed' && values[i + 1] === 'vertical')
      ) {
        transformedList.push('vertical');
        i++;
      } else {
        transformedList.push(values[i]);
      }
    }
    newUserStoriesSequence.set(key, transformedList);
  });

  return newUserStoriesSequence;
};

const addSequencesToDom = (
  cleanedUserStoriesSequence: Map<string, string[]>,
) => {
  cleanedUserStoriesSequence.forEach((sequences, userStoryName) => {
    const userStory = document.querySelector(`#${userStoryName}`);
    if (!userStory) {
      return;
    }
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
