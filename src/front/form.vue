<script setup lang="ts">

import Team from './team.vue';
</script>
<template>
  <main class="responsive">
    <nav class="tabbed">
      <a data-testid="team-tab">
        <i>groups</i>
        <span>Teams</span>
      </a>
      <a data-testid="reviewers-tab">
        <i>groups</i>
        <span>Teams</span>
      </a>
    </nav>
    <Team></Team>
  </main>
</template>