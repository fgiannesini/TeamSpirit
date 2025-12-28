import type {Developer, TeamModification, UserStory} from './form-store.ts';

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
  period: {
    start: new Date('2025-12-25'),
    end: new Date('2025-12-26'),
  },
  ...option,
});

export const userStory = (option: Partial<UserStory> = {}): UserStory => ({
  id: 0,
  complexity: 3,
  reviewComplexity: 2,
  priority:1,
  ...option,
});
