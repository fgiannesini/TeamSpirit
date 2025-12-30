<script setup lang="ts">
import { noBugGenerator } from '../../simulate/bug-generator.ts';
import {
  createBacklog,
  createThread,
  parallelTeam,
} from '../../simulate/factory.ts';
import { noPriorityModificator } from '../../simulate/priority-modificator.ts';
import { simulate } from '../../simulate/simulation.ts';
import { noTeamModificator } from '../../simulate/team-modificator.ts';
import { useFormStore } from '../form-store.ts';
import Resume from '../resume/resume.vue';

let store = useFormStore();
const team = parallelTeam(
  store.developers.map((developer) =>
    createThread({ id: developer.id, power: developer.experience }),
  ),
);
</script>

<template>
  <nav class="right" data-testid="resume-panel">
    Configuration
    <resume/>
    <button data-testid="launch-button" @click="simulate(createBacklog(),team, noBugGenerator, noTeamModificator, noPriorityModificator)">Launch</button>
  </nav>
</template>