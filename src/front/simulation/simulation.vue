<script setup lang="ts">
import {noBugGenerator} from '../../simulate/bug-generator.ts';
import {createBacklog, createThread, parallelTeam, todo,} from '../../simulate/factory.ts';
import {noPriorityModificator} from '../../simulate/priority-modificator.ts';
import {simulate} from '../../simulate/simulation.ts';
import {computeStatEvents} from '../../simulate/stats.ts';
import {noTeamModificator} from '../../simulate/team-modificator.ts';
import {useFormStore} from '../form-store.ts';
import Resume from "../resume/resume.vue";

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

const launchSimulation = () => {
  let {timeEvents} = simulate(
      backlog,
      team,
      noBugGenerator,
      noTeamModificator,
      noPriorityModificator,
  );
  computeStatEvents(timeEvents);
};
</script>

<template>
  <main class="responsive">
    <div data-testid="stats-container">coucou</div>
  </main>
  <nav class="right" data-testid="resume-panel">
    Configuration
    <resume/>
    <button data-testid="launch-button" @click="launchSimulation();">Launch</button>
  </nav>
</template>