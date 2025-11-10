<script setup lang="ts">
import { type Ref, ref } from 'vue';
import Resume from './resume/resume.vue';
import Reviewers from './reviewers/reviewers.vue';
import Team from './team/team.vue';

type TabName = 'team' | 'reviewers';
const active: Ref<TabName> = ref('team');
const activate = (tabName: TabName): void => {
  active.value = tabName;
};
</script>
<template>
  <main class="responsive">
    <nav>
      <div class="center-align">
        <button
          data-testid="team-tab"
          @click="activate('team')"
          :class="[active === 'team' ? 'active' : '']"
        >
          <i>groups</i>
        </button>
        <div class="small-margin">Team</div>
      </div>
      <hr class="medium-width">
      <div class="center-align">
        <button
          data-testid="reviewers-tab"
          @click="activate('reviewers')"
          :class="[active === 'reviewers' ? 'active' : '']"
        >
          <i>share_reviews</i>
        </button>
        <div class="small-margin">Reviewers</div>
      </div>

      <div class="center-align">
        <button
            data-testid="team-modificator-tab"
        >
        </button>
      </div>
    </nav>
    <div
      data-testid="team-container"
      :class="[active === 'team' ? 'active' : '','page', 'padding']"
    >
      <Team></Team>
    </div>
    <div
      data-testid="reviewers-container"
      :class="[active === 'reviewers' ? 'active' : '','page', 'padding']"
    >
      <Reviewers></Reviewers>
    </div>
  </main>
  <nav class="right medium-width" data-testid="resume-panel">
    Resume <Resume></Resume>
  </nav>
</template>
