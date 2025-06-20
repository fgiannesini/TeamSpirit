import './time-sequence.scss';
import {
  loadStructureEvents,
  loadTimeEvents,
} from '../flow/storage/session-storage.ts';
import type { TimeEvent } from '../simulate/events.ts';
import type { StructureEvent } from '../simulate/simulation-structure.ts';
import type { State } from '../simulate/user-story.ts';

const createUserStory = (userStoryId: number, name: string): HTMLDivElement => {
  const userStoryHtmlElement = document.createElement('div');
  userStoryHtmlElement.id = `user-story-${userStoryId}`;
  userStoryHtmlElement.className = 'user-story';

  const userStoryTitle = document.createElement('span');
  userStoryTitle.textContent = name;
  userStoryTitle.className = 'user-story-title';
  userStoryHtmlElement.appendChild(userStoryTitle);

  return userStoryHtmlElement;
};

const createTimeSequenceElement = (className: string): HTMLDivElement => {
  const timeSequenceElement = document.createElement('div');
  timeSequenceElement.className = className;
  return timeSequenceElement;
};

const getDeduplicatesEventsStates = (
  currentEvents: TimeEvent[],
): {
  userStoryId: number;
  state: State;
}[] => {
  const values = currentEvents
    .reduce<Map<string, { userStoryId: number; state: State }>>(
      (acc, { userStoryId, state }) => {
        const key = `${userStoryId}_${state}`;
        acc.set(key, { userStoryId, state });
        return acc;
      },
      new Map(),
    )
    .values();
  return Array.from(values);
};

const generateSequences = (
  timeEvents: TimeEvent[],
  userStoryIds: number[],
): Map<number, string[]> => {
  const userStoriesSequence = new Map<number, string[]>(
    userStoryIds.map((userStoryId) => [userStoryId, []]),
  );

  const maxTime = Math.max(...timeEvents.map((event) => event.time));
  let time = 0;
  while (maxTime !== time) {
    time++;
    const currentEvents = timeEvents.filter((event) => event.time === time);
    const eventStates = getDeduplicatesEventsStates(currentEvents);
    eventStates.forEach(({ userStoryId, state }) => {
      if (state === 'InProgress' || state === 'Review') {
        const sequence = userStoriesSequence.get(userStoryId);
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
  userStoriesSequence: Map<number, string[]>,
): Map<number, string[]> => {
  const newUserStoriesSequence = new Map<number, string[]>();

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
  cleanedUserStoriesSequence: Map<number, string[]>,
): void => {
  cleanedUserStoriesSequence.forEach((sequences, userStoryId) => {
    const userStory = document.querySelector(`#user-story-${userStoryId}`);
    if (!userStory) {
      return;
    }
    sequences.forEach((element) => {
      userStory.appendChild(createTimeSequenceElement(element));
    });
  });
};

const renderTimeSequence = (
  timeEvents: TimeEvent[],
  structureEvents: StructureEvent[],
): void => {
  const parent = document.querySelector('#user-stories');
  if (!parent) {
    return;
  }
  const userStoryCreations = structureEvents.filter(
    ({ action }) => action === 'CreateUserStory',
  );
  userStoryCreations
    .filter(({ id }) => id !== -1)
    .map(({ id, name }) => createUserStory(id, name))
    .forEach((userStoryElement) => {
      parent.appendChild(userStoryElement);
    });
  const userStoriesIds = userStoryCreations.map(({ id }) => id);
  const userStoriesSequence = generateSequences(timeEvents, userStoriesIds);
  const cleanedUserStoriesSequence =
    cleanConsecutiveVerticals(userStoriesSequence);
  addSequencesToDom(cleanedUserStoriesSequence);
};

const params: URLSearchParams = new URLSearchParams(window.location.search);
const idFromUrl: string | null = params.get('id');
if (idFromUrl) {
  renderTimeSequence(loadTimeEvents(idFromUrl), loadStructureEvents(idFromUrl));
}
