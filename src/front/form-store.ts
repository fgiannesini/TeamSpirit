import { defineStore, type StoreDefinition } from 'pinia';

type State = {
  teamMode: TeamMode;
};

export type TeamMode = 'random' | 'custom' | 'notSet';

export const useFormStore: StoreDefinition = defineStore('form', {
  state: (): State => ({ teamMode: 'notSet' }),
  getters: {},
  actions: {
    setTeamMode(teamMode: TeamMode): void {
      this.teamMode = teamMode;
    },
  },
});
