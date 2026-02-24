<script setup lang="ts">
import {noBugGenerator} from '../../simulate/bug-generator.ts';
import {createBacklog, createThread, parallelTeam, todo,} from '../../simulate/factory.ts';
import {noPriorityModificator} from '../../simulate/priority-modificator.ts';
import {simulate} from '../../simulate/simulation.ts';
import {computeStatEvents, type StatEvent} from '../../simulate/stats.ts';
import {noTeamModificator} from '../../simulate/team-modificator.ts';
import {useFormStore} from '../form-store.ts';
import Resume from "../resume/resume.vue";
import {ref} from "vue";

let store = useFormStore();
const team = parallelTeam(
    store.developers.map((developer) =>
        createThread({id: developer.id, power: developer.experience}),
    ),
    store.reviewers,
);
const backlog = createBacklog({
  userStoriesRemaining: store.userStories.map(
      ({id, complexity, reviewComplexity, priority}) =>
          todo({
            id,
            complexity,
            review: {
              reviewers: new Map(),
              reviewComplexity,
            },
            priority,
          }),
  ),
});
const stats = ref<StatEvent[]>([]);
const launchSimulation = () => {
  let {timeEvents} = simulate(
      backlog,
      team,
      noBugGenerator,
      noTeamModificator,
      noPriorityModificator,
  );
  stats.value = computeStatEvents(timeEvents);
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
      <tr>
        <td data-testid="stats-total-time-0">{{ stats.length }}</td>
        <td data-testid="stats-lead-time-0">{{stats[stats.length - 1]?.leadTime}}</td>
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