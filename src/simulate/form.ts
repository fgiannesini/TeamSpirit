export const generateDevForm = (id: number) => {
  const identifier = document.createElement('span');
  identifier.id = `dev-identifier-${id}`;
  identifier.textContent = id.toString();

  const powerLabel = generateLabel('Power');
  const powerInput = generateInput(`power-input-${id}`, 1);

  const dev = document.createElement('div');
  dev.append(identifier, powerLabel, powerInput);
  return dev;
};

const generateInput = (id: string, value: number) => {
  const input = document.createElement('input');
  input.id = id;
  input.type = 'number';
  input.min = '1';
  input.value = value.toString();
  return input;
};

const generateLabel = (content: string) => {
  const labelElement = document.createElement('label');
  labelElement.textContent = content;
  return labelElement;
};

export const generateUserStoriesForm = (id: number) => {
  const identifier = document.createElement('span');
  identifier.id = `user-story-identifier-${id}`;
  identifier.textContent = id.toString();

  const complexityLabel = generateLabel('Complexity');
  const complexityInput = generateInput(`complexity-input-${id}`, 5);
  const reviewComplexityLabel = generateLabel('Review complexity');
  const reviewComplexityInput = generateInput(
    `review-complexity-input-${id}`,
    2,
  );

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
