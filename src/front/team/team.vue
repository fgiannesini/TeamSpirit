<script setup lang="ts">
import { ref } from 'vue';
import { useFormStore } from '../form-store.ts';
import CustomTeam from './custom-team.vue';

type TeamMode = 'random' | 'custom';
const active = ref('');
const formStore = useFormStore();
const activate = (teamMode: TeamMode) => {
  active.value = teamMode;
  formStore.setTeamMode(teamMode);
};
</script>
<template>
  <nav>
    <label class="radio">
      <input data-testid="random-radio" type="radio" name="team" @click="activate('random')" :checked="formStore.$state.teamMode === 'random'">
      <span>Random</span>
    </label>
    <label class="radio">
      <input data-testid="custom-radio" type="radio" name="team" @click="activate('custom')" :checked="formStore.$state.teamMode === 'custom'">
      <span>Custom</span>
    </label>
  </nav>
  <div data-testid="custom-container" :class="[active === 'custom'?'active' : '', 'page', 'padding']">
    <CustomTeam></CustomTeam>
  </div>
</template>
