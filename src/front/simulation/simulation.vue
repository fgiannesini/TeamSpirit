<script setup lang="ts">
import {noBugGenerator} from '../../simulate/bug-generator.ts';
import {noPriorityModificator} from '../../simulate/priority-modificator.ts';
import {simulate} from '../../simulate/simulation.ts';
import {computeStatEvents, type StatEvent} from '../../simulate/stats.ts';
import {noTeamModificator} from '../../simulate/team-modificator.ts';
import {useFormStore} from '../form-store.ts';
import Resume from "../resume/resume.vue";
import {ref} from "vue";

let store = useFormStore();

const stats = ref<StatEvent[][]>([]);
const launchSimulation = () => {
  stats.value = store.toSimulationInputs().map(({backlog, team}) =>{
     let {timeEvents} = simulate(
         backlog,
         team,
         noBugGenerator,
         noTeamModificator,
         noPriorityModificator,
     );
    return computeStatEvents(timeEvents);
  } );
};
</script>

<template>
  <main class="responsive">
    <table class="border" data-testid="stats-container">
      <thead>
      <tr>
        <th data-testid="stats-total-time-header">Total time</th>
        <th data-testid="stats-lead-time-header">Lead time</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(stat,index) in stats" >
        <td :data-testid="`stats-total-time-${index}`">{{ stat.length }}</td>
        <td :data-testid="`stats-lead-time-${index}`">{{ stat[stat.length - 1]?.leadTime }}</td>
      </tr>
      </tbody>
    </table>
  </main>
  <nav class="right" data-testid="resume-panel">
    Configuration
    <resume/>
    <button data-testid="launch-button" @click="launchSimulation();">Launch</button>
  </nav>
</template>