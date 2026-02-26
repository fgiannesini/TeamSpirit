<script setup lang="ts">
import {noBugGenerator} from '../../simulate/bug-generator.ts';
import {noPriorityModificator} from '../../simulate/priority-modificator.ts';
import {simulate} from '../../simulate/simulation.ts';
import {computeStatEvents} from '../../simulate/stats.ts';
import {noTeamModificator} from '../../simulate/team-modificator.ts';
import {useFormStore} from '../form-store.ts';
import Resume from '../resume/resume.vue';
import {ref} from 'vue';
import {copy} from '../../simulate/backlog.ts';
import type {TeamType} from '../../simulate/team.ts';

let store = useFormStore();

type Line = {
  totalTime: number;
  leadTime: number;
  userStoryCount: number;
  teamType: TeamType;
};
const lines = ref<Line[]>([]);
const iterationCount = ref<number>(1);
const launchSimulation = () => {
  lines.value = Array.from({ length: iterationCount.value }).flatMap(() =>
    store.toSimulationInputs().map(({ backlog, team }) => {
      let { timeEvents, structureEvents } = simulate(
        copy(backlog),
        team.copy(),
        noBugGenerator,
        noTeamModificator,
        noPriorityModificator,
      );
      const statEvents = computeStatEvents(timeEvents);
      return {
        totalTime: statEvents.length,
        leadTime: statEvents[statEvents.length - 1]?.leadTime,
        userStoryCount: structureEvents.filter(
          ({ action }) => action === 'CreateUserStory',
        ).length,
        teamType: team.getType(),
      };
    }),
  );
};
</script>

<template>
  <main class="responsive">
    <table class="no-space stripes" data-testid="stats-container">
      <thead>
      <tr>
        <th data-testid="stats-total-time-header">Total time</th>
        <th data-testid="stats-lead-time-header">Lead time</th>
        <th data-testid="user-story-count-header">User story count</th>
        <th data-testid="team-type-header">Team</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(line,index) in lines" >
        <td :data-testid="`stats-total-time-${index}`">{{ line.totalTime }}</td>
        <td :data-testid="`stats-lead-time-${index}`">{{ line.leadTime }}</td>
        <td :data-testid="`user-story-count-${index}`">{{ line.userStoryCount }}</td>
        <td :data-testid="`team-type-${index}`">{{ line.teamType }}</td>
      </tr>
      </tbody>
    </table>
  </main>
  <nav class="right" data-testid="resume-panel">
    Configuration
    <resume/>
    <div class="field label prefix border">
      <i>numbers</i>
      <input data-testid="iteration-count-input" type="number" v-model="iterationCount">
      <label data-testid="iteration-count-label">Iteration count</label>
    </div>
    <button data-testid="launch-button" @click="launchSimulation();">Launch</button>
  </nav>
</template>