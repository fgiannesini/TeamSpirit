import { defineStore } from 'pinia';

export type State = {
  teamMode: TeamMode;
  developers: Developer[];
};

export type TeamMode = 'random' | 'custom' | 'notSet';

export type Developer = {
  id: number;
};

// biome-ignore lint/nursery/useExplicitType: type is dynamic
export const useFormStore = defineStore('form', {
  state: (): State => ({ teamMode: 'notSet', developers: [] }),
  actions: {
    setTeamMode(teamMode: TeamMode): void {
      this.teamMode = teamMode;
    },
    generateDeveloper(): void {
      const max =
        this.developers.length > 0
          ? Math.max(...this.developers.map(({ id }) => id)) + 1
          : 0;
      this.developers = [...this.developers, { id: max }];
    },
    removeDeveloper(targetId: number): void {
      this.developers = this.developers.filter(({ id }) => id !== targetId);
    },
  },
});
