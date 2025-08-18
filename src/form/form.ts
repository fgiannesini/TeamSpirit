const generateInput = (id: string, value: number): HTMLInputElement => {
  const input = document.createElement('input');
  input.id = id;
  input.type = 'number';
  input.min = '1';
  input.value = value.toString();
  return input;
};

const generateLabel = (content: string, htmlFor: string): HTMLLabelElement => {
  const labelElement = document.createElement('label');
  labelElement.textContent = content;
  labelElement.htmlFor = htmlFor;
  return labelElement;
};

const randomInt = (max: number): number => Math.floor(Math.random() * max) + 1;

export const generateDevForm = (id: number): HTMLDivElement => {
  const identifier = document.createElement('span');
  identifier.id = `dev-identifier-${id}`;
  identifier.textContent = id.toString();

  const powerInputId = `power-input-${id}`;
  const powerLabel = generateLabel('Power', powerInputId);
  const powerInput = generateInput(powerInputId, randomInt(5));

  const dev = document.createElement('div');
  dev.append(identifier, powerLabel, powerInput);
  return dev;
};

export const generateUserStoriesForm = (id: number): HTMLDivElement => {
  const identifier = document.createElement('span');
  identifier.id = `user-story-identifier-${id}`;
  identifier.textContent = id.toString();

  const complexityInputId = `complexity-input-${id}`;
  const complexityLabel = generateLabel('Complexity', complexityInputId);
  const complexity = randomInt(10);
  const complexityInput = generateInput(complexityInputId, complexity);

  const reviewComplexityInputId = `review-complexity-input-${id}`;
  const reviewComplexityLabel = generateLabel(
    'Review complexity',
    reviewComplexityInputId,
  );
  const reviewComplexityInput = generateInput(
    reviewComplexityInputId,
    Math.max(1, randomInt(complexity - 1)),
  );

  const priorityInputId = `priority-input-${id}`;
  const priorityLabel = generateLabel('Priority', priorityInputId);
  const priorityInput = generateInput(priorityInputId, randomInt(6) - 1);

  const userStory = document.createElement('div');
  userStory.append(
    identifier,
    complexityLabel,
    complexityInput,
    reviewComplexityLabel,
    reviewComplexityInput,
    priorityLabel,
    priorityInput,
  );
  return userStory;
};

export const generateTeamModificatorEventsForm = (
  eventCount: number,
): HTMLDivElement => {
  const offInputId = `team-modificator-event-${eventCount}-off-input`;
  const offLabel = generateLabel('Off', offInputId);
  const offInput = generateInput(offInputId, 3);

  const inInputId = `team-modificator-event-${eventCount}-in-input`;
  const inLabel = generateLabel('In', inInputId);
  const inInput = generateInput(inInputId, 5);

  const threadNameInputId = `team-modificator-event-${eventCount}-thread-name-input`;
  const threadNameLabel = generateLabel('Thread name', threadNameInputId);
  const threadNameInput = document.createElement('input');
  threadNameInput.id = threadNameInputId;

  const buttonElement = document.createElement('button');
  buttonElement.textContent = 'Remove';
  buttonElement.id = `remove-event-button-${eventCount}`;
  buttonElement.addEventListener('click', (event) => {
    const target = event.target as HTMLButtonElement;
    target.parentElement?.remove();
  });

  const divElement = document.createElement('div');
  divElement.id = `team-modificator-event-${eventCount}`;
  divElement.append(
    threadNameLabel,
    threadNameInput,
    offLabel,
    offInput,
    inLabel,
    inInput,
    buttonElement,
  );
  return divElement;
};

export const generateBugGeneratorEventsForm = (
  eventCount: number,
): HTMLDivElement => {
  const timeInputId = `bug-generator-event-${eventCount}-time-input`;
  const timeLabel = generateLabel('Time', timeInputId);
  const timeInput = generateInput(timeInputId, 3);

  const complexityInputId = `bug-generator-event-${eventCount}-complexity-input`;
  const complexityLabel = generateLabel('Complexity', complexityInputId);
  const complexityInput = generateInput(complexityInputId, 1);

  const reviewComplexityInputId = `bug-generator-event-${eventCount}-review-complexity-input`;
  const reviewComplexityLabel = generateLabel(
    'Review complexity',
    reviewComplexityInputId,
  );
  const reviewComplexityInput = generateInput(reviewComplexityInputId, 1);

  const buttonElement = document.createElement('button');
  buttonElement.textContent = 'Remove';
  buttonElement.id = `remove-event-button-${eventCount}`;
  buttonElement.addEventListener('click', (event) => {
    const target = event.target as HTMLButtonElement;
    target.parentElement?.remove();
  });

  const divElement = document.createElement('div');
  divElement.id = `bug-generator-event-${eventCount}`;
  divElement.append(
    timeLabel,
    timeInput,
    reviewComplexityLabel,
    reviewComplexityInput,
    complexityLabel,
    complexityInput,
    buttonElement,
  );
  return divElement;
};
