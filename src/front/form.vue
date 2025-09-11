<script setup lang="ts">

import Team from './team.vue';
import {type Ref, ref} from "vue";

type TabName = 'team' | 'reviewers'
const active: Ref<TabName> = ref("team");
const activate = (tabName : TabName): void => {
  active.value = tabName;
}
</script>
<template>
  <main class="responsive">
    <nav class="tabbed">
      <a data-testid="team-tab" @click="activate('team')" :class="[active === 'team' ? 'active' : '']">
        <i>groups</i>
        <span>Teams</span>
      </a>
      <a data-testid="reviewers-tab" @click="activate('reviewers')" :class="[active === 'reviewers' ? 'active' : '']">
        <i>share_reviews</i>
        <span>Reviewers</span>
      </a>
    </nav>
    <Team></Team>
  </main>
</template>