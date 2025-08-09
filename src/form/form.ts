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

export const generateDevForm = (id: number): HTMLDivElement => {
  const identifier = document.createElement('span');
  identifier.id = `dev-identifier-${id}`;
  identifier.textContent = id.toString();

  const powerInputId = `power-input-${id}`;
  const powerLabel = generateLabel('Power', powerInputId);
  const powerInput = generateInput(powerInputId, 1);

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
  const complexityInput = generateInput(complexityInputId, 5);
  const reviewComplexityInputId = `review-complexity-input-${id}`;
  const reviewComplexityLabel = generateLabel(
    'Review complexity',
    reviewComplexityInputId,
  );
  const reviewComplexityInput = generateInput(reviewComplexityInputId, 2);

  const userStory = document.createElement('div');
  userStory.append(
    identifier,
    complexityLabel,
    complexityInput,
    reviewComplexityLabel,
    reviewComplexityInput,
  );
  return userStory;
};

export const generateTeamModificatorEventsForm = (eventCount: number) => {
  const inInputId = `in-input-${eventCount}`;
  const inInput = generateInput(inInputId, eventCount);
  const inLabel = generateLabel('In', inInputId);

  const offInputId = `off-input-${eventCount}`;
  const offInput = generateInput(offInputId, eventCount);
  const offLabel = generateLabel('Off', offInputId);

  const buttonElement = document.createElement('button');
  buttonElement.textContent = 'Remove';
  buttonElement.id = `remove-event-button-${eventCount}`;
  buttonElement.addEventListener('click', (event) => {
    const target = event.target as HTMLButtonElement;
    target.parentElement?.remove();
  });

  const divElement = document.createElement('div');
  divElement.append(offLabel, offInput, inLabel, inInput, buttonElement);
  return divElement;
};
