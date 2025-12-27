import { defineStore } from 'pinia';

const tomorrow = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
};

export type State = {
  teamMode: SelectorMode;
  teamModificatorMode: SelectorMode;
  userStoriesMode: SelectorMode;
  developers: Developer[];
  teamModificators: TeamModification[];
  reviewers: number;
  userStories: UserStory[];
};

export type SelectorMode = 'random' | 'custom' | 'notSet';

export type Developer = {
  id: number;
  experience: number;
};

export type Period = {
  start: Date;
  end: Date;
};
export type TeamModification = {
  id: number;
  selectedDevelopers: Developer[];
  period: Period;
};

export type UserStory = {
  id: number;
};

export const useFormStore = defineStore('form', {
  state: (): State => ({
    teamMode: 'notSet',
    teamModificatorMode: 'notSet',
    userStoriesMode: 'notSet',
    developers: [],
    teamModificators: [],
    reviewers: 0,
    userStories: [],
  }),
  actions: {
    generateDeveloper(): void {
      const max =
        this.developers.length > 0
          ? Math.max(...this.developers.map(({ id }) => id)) + 1
          : 0;
      this.developers = [...this.developers, { id: max, experience: 3 }];
    },
    removeDeveloper(targetId: number): void {
      this.developers = this.developers.filter(({ id }) => id !== targetId);
    },
    generateTeamModification(): void {
      const max =
        this.teamModificators.length > 0
          ? Math.max(...this.teamModificators.map(({ id }) => id)) + 1
          : 0;
      this.teamModificators = [
        ...this.teamModificators,
        {
          id: max,
          selectedDevelopers: [],
          period: {
            start: new Date(),
            end: tomorrow(),
          },
        },
      ];
    },
    removeTeamModification(targetId: number): void {
      this.teamModificators = this.teamModificators.filter(
        ({ id }) => id !== targetId,
      );
    },
    generateUserStory(): void {},
  },
});
