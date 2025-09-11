<script setup lang="ts">
import CustomTeam from "./custom-team.vue";
import {ref} from "vue";

type TeamMode = 'random' | 'custom'
let active = ref('')
const activate = (teamMode: TeamMode) => {
  active.value = teamMode
}
</script>
<template>
  <nav>
    <label class="radio">
      <input data-testid="random-radio" type="radio" name="team" >
      <span>Random</span>
    </label>
    <label class="radio">
      <input data-testid="custom-radio" type="radio" name="team" @click="activate('custom')">
      <span>Custom</span>
    </label>
  </nav>
  <div data-testid="custom-container" :class="[active === 'custom'?'active' : '', 'page', 'padding']">
    <CustomTeam></CustomTeam>
  </div>
</template>
