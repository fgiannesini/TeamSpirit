import { defineStore } from 'pinia';

type State = {
  teamMode: TeamMode;
};

export type TeamMode = 'random' | 'custom' | 'notSet';

// biome-ignore lint/nursery/useExplicitType: type is dynamic
export const useFormStore = defineStore('form', {
  state: (): State => ({ teamMode: 'notSet' }),
  actions: {
    setTeamMode(teamMode: TeamMode): void {
      this.teamMode = teamMode;
    },
  },
});
