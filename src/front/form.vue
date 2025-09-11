<script setup lang="ts">

import Team from './team.vue';
import {ref} from "vue";

type TabName = 'teams' | 'reviewers'
const active = ref("teams");
const activate = (tabName : TabName): void => {
  active.value = tabName;
}
</script>
<template>
  <main class="responsive">
    <nav class="tabbed">
      <a data-testid="team-tab" :class="[active !== 'reviewers' ? 'active' : '']">
        <i>groups</i>
        <span>Teams</span>
      </a>
      <a data-testid="reviewers-tab" @click="activate('reviewers')" :class="[active === 'reviewers' ? 'active' : '']">
        <i>groups</i>
        <span>Reviewers</span>
      </a>
    </nav>
    <Team></Team>
  </main>
</template>