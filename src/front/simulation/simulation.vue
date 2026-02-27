<script setup lang="ts">
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {copy} from '../../simulate/backlog.ts';
import {noBugGenerator} from '../../simulate/bug-generator.ts';
import {noPriorityModificator} from '../../simulate/priority-modificator.ts';
import {simulate} from '../../simulate/simulation.ts';
import {computeStatEvents} from '../../simulate/stats.ts';
import type {TeamType} from '../../simulate/team.ts';
import {noTeamModificator} from '../../simulate/team-modificator.ts';
import {useFormStore} from '../form-store.ts';
import Resume from '../resume/resume.vue';

let store = useFormStore();

type Line = {
  totalTime: number;
  leadTime: number;
  userStoryCount: number;
  teamType: TeamType;
};

const lines = ref<Line[]>([]);
const iterationCountRef = ref<number>(1);
const launchSimulation = (iterationCount: number) => {
  lines.value = Array.from({ length: iterationCount }).flatMap(() =>
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
const router = useRouter();
const toPlay = async () => {
  await router.push('/play');
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
        <th data-testid="runner-header">Run</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(line,index) in lines" >
        <td :data-testid="`stats-total-time-${index}`">{{ line.totalTime }}</td>
        <td :data-testid="`stats-lead-time-${index}`">{{ line.leadTime }}</td>
        <td :data-testid="`user-story-count-${index}`">{{ line.userStoryCount }}</td>
        <td :data-testid="`team-type-${index}`">{{ line.teamType }}</td>
        <td :data-testid="`runner-${index}`"><button :data-testid="`runner-button-${index}`" class="transparent circle small" @click="toPlay();"><i>play_arrow</i></button></td>
      </tr>
      </tbody>
    </table>
  </main>
  <nav class="right" data-testid="resume-panel">
    Configuration
    <resume/>
    <div class="field label prefix border">
      <i>numbers</i>
      <input data-testid="iteration-count-input" type="number" v-model="iterationCountRef">
      <label data-testid="iteration-count-label">Iteration count</label>
    </div>
    <button data-testid="launch-button" @click="launchSimulation(iterationCountRef);">Launch</button>
  </nav>
</template>