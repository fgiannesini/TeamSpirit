import { defineStore } from 'pinia';

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

export type TeamModification = {
  id: number;
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
      this.teamModificators = [...this.teamModificators, { id: max }];
    },
    removeTeamModification(targetId: number): void {
      this.teamModificators = this.teamModificators.filter(
        ({ id }) => id !== targetId,
      );
    },
  },
});
