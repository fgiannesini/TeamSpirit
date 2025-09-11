<script setup lang="ts">

import {type Ref, ref} from "vue";
import Reviewers from "./reviewers.vue";
import Team from "./team.vue";

type TabName = 'team' | 'reviewers'
const active: Ref<TabName> = ref("team");
const activate = (tabName: TabName): void => {
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
    <div data-testid="team-container" :class="[active === 'team' ? 'active' : '','page', 'padding']">
      <Team></Team>
    </div>
    <div data-testid="reviewers-container" :class="[active === 'reviewers' ? 'active' : '','page', 'padding']">
      <Reviewers></Reviewers>
    </div>
  </main>
  <nav class="right medium-width" data-testid="resume-panel">Resume</nav>
</template>