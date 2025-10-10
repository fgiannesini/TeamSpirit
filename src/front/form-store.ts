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
      this.developers.push({ id: 0 });
    },
  },
});
