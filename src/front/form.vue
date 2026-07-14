<script setup lang="ts">
import { type Ref, ref } from 'vue';
import Resume from './resume/resume.vue';
import Reviewers from './reviewers/reviewers.vue';
import Team from './team/team.vue';
import TeamModificator from './team-modificator/team-modificator.vue';
import PriorityModificator from './priority-modificator/priority-modificator.vue';
import BugGenerator from './bug-generator/bug-generator.vue';
import UserStories from './user-stories/user-stories.vue';

type TabName =
  | 'team'
  | 'reviewers'
  | 'team-modificator'
  | 'priority-modificator'
  | 'bug-generator'
  | 'user-stories';
const active: Ref<TabName> = ref('team');
const activate = (tabName: TabName): void => {
  active.value = tabName;
};
</script>
<template>
  <main class="responsive">
    <nav class="scroll">
      <div class="center-align">
        <button
          data-testid="team-tab"
          @click="activate('team')"
          :class="{ active: active === 'team' }"
        >
          <i>groups</i>
        </button>
        <div class="small-margin">Team</div>
      </div>
      <hr class="small-width" />
      <div class="center-align">
        <button
          data-testid="reviewers-tab"
          @click="activate('reviewers')"
          :class="{ active: active === 'reviewers' }"
        >
          <i>share_reviews</i>
        </button>
        <div class="small-margin">Reviewers</div>
      </div>
      <hr class="small-width" />
      <div class="center-align">
        <button
          data-testid="team-modificator-tab"
          @click="activate('team-modificator')"
          :class="{ active: active === 'team-modificator' }"
        >
          <i>group_remove</i>
        </button>
        <div class="small-margin">Team Modificator</div>
      </div>
      <hr class="small-width" />
      <div class="center-align">
        <button
          data-testid="priority-modificator-tab"
          @click="activate('priority-modificator')"
          :class="{ active: active === 'priority-modificator' }"
        >
          <i>priority_high</i>
        </button>
        <div class="small-margin">Priority Modificator</div>
      </div>
      <hr class="small-width" />
      <div class="center-align">
        <button
          data-testid="bug-generator-tab"
          @click="activate('bug-generator')"
          :class="{ active: active === 'bug-generator' }"
        >
          <i>bug_report</i>
        </button>
        <div class="small-margin">Bug Generator</div>
      </div>
      <hr class="small-width" />
      <div class="center-align">
        <button
          data-testid="user-stories-tab"
          @click="activate('user-stories')"
          :class="{ active: active === 'user-stories' }"
        >
          <i>book_4</i>
        </button>
        <div class="small-margin">User stories</div>
      </div>
    </nav>
    <div data-testid="team-container" :class="['page', 'padding', { active: active === 'team' }]">
      <Team></Team>
    </div>
    <div
      data-testid="reviewers-container"
      :class="['page', 'padding', { active: active === 'reviewers' }]"
    >
      <Reviewers />
    </div>
    <div
      data-testid="team-modificator-container"
      :class="['page', 'padding', { active: active === 'team-modificator' }]"
    >
      <TeamModificator />
    </div>
    <div
      data-testid="priority-modificator-container"
      :class="['page', 'padding', { active: active === 'priority-modificator' }]"
    >
      <PriorityModificator />
    </div>
    <div
      data-testid="bug-generator-container"
      :class="['page', 'padding', { active: active === 'bug-generator' }]"
    >
      <BugGenerator />
    </div>
    <div
      data-testid="user-stories-container"
      :class="['page', 'padding', { active: active === 'user-stories' }]"
    >
      <UserStories></UserStories>
    </div>
  </main>
  <nav class="right" style="width: 15rem" data-testid="resume-panel">
    Resume
    <resume />
    <button data-testid="launch-button" @click="$router.push('/simulate')">Launch</button>
  </nav>
</template>
