<script setup lang="ts">
import {type Ref, ref} from 'vue';
import Resume from './resume/resume.vue';
import Reviewers from './reviewers/reviewers.vue';
import Team from './team/team.vue';
import TeamModificator from "./team-modificator/team-modificator.vue";

type TabName = 'team' | 'reviewers' | 'team-modificator';
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
      <hr class="medium-width">
      <div class="center-align">
        <button
            data-testid="team-modificator-tab"
            @click="activate('team-modificator')"
            :class="[active === 'team-modificator' ? 'active' : '']"
        >
        </button>
        <div class="small-margin">Team Modificator</div>
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
      <Reviewers/>
    </div>
    <div
        data-testid="team-modificator-container"
        :class="[active === 'team-modificator' ? 'active' : '','page', 'padding']"
    >
      <TeamModificator/>
    </div>
  </main>
  <nav class="right medium-width" data-testid="resume-panel">
    Resume
    <Resume/>
  </nav>
</template>
