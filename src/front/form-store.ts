import { defineStore } from 'pinia';

const tomorrow = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
};

export type State = {
  teamMode: SelectorMode;
  teamModificatorMode: SelectorMode;
  developers: Developer[];
  teamModificators: TeamModification[];
  reviewers: number;
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

// biome-ignore lint/nursery/useExplicitType: type is dynamic
export const useFormStore = defineStore('form', {
  state: (): State => ({
    teamMode: 'notSet',
    teamModificatorMode: 'notSet',
    developers: [],
    teamModificators: [],
    reviewers: 0,
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
  },
});
