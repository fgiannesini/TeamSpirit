import type { Developer, TeamModification } from './form-store.ts';

export const developer = (option: Partial<Developer> = {}): Developer => ({
  id: 0,
  experience: 3,
  ...option,
});

export const teamModification = (
  option: Partial<TeamModification> = {},
): TeamModification => ({
  id: 0,
  selectedDevelopers: [],
  ...option,
});
