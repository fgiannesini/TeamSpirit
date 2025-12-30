<script setup lang="ts">
import { noBugGenerator } from '../../simulate/bug-generator.ts';
import { createBacklog, parallelTeam } from '../../simulate/factory.ts';
import { noPriorityModificator } from '../../simulate/priority-modificator.ts';
import { simulate } from '../../simulate/simulation.ts';
import { noTeamModificator } from '../../simulate/team-modificator.ts';
import Resume from '../resume/resume.vue';
</script>

<template>
  <nav class="right" data-testid="resume-panel">
    Configuration
    <resume/>
    <button data-testid="launch-button" @click="simulate(createBacklog(),parallelTeam(), noBugGenerator, noTeamModificator, noPriorityModificator)">Launch</button>
  </nav>
</template>