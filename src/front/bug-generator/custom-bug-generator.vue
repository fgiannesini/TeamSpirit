<template>
  <div v-if="hasBugGenerations" data-testid="setting-state">
    <add-button text="Add a bug generation" @click="addBugGeneration" />
    <div class="grid">
      <div class="s12 m6 l4" v-for="bugGeneration in store.bugGenerations" :key="bugGeneration.id">
        <BugCard
          :id="bugGeneration.id"
          :data-testid="`bug-generation-${bugGeneration.id}`"
          v-model:date="bugGeneration.date"
          v-model:complexity="bugGeneration.complexity"
          v-model:review-complexity="bugGeneration.reviewComplexity"
          v-model:priority="bugGeneration.priority"
          @remove="removeBugGeneration(bugGeneration.id)"
        />
      </div>
    </div>
  </div>
  <article v-else class="medium middle-align center-align" data-testid="empty-state">
    <div>
      <i class="extra">bug_report</i>
      <h5>No bug generation exists</h5>
      <div class="medium-space"></div>
      <add-button text="Add a bug generation" @click="addBugGeneration" />
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useFormStore } from '../form-store.ts';
import AddButton from '../shared/add-button.vue';
import BugCard from './bug-card.vue';

const store = useFormStore();
const addBugGeneration = (): void => {
  store.generateBugGeneration();
};
const removeBugGeneration = (targetId: number): void => {
  store.removeBugGeneration(targetId);
};
const hasBugGenerations = computed(() => store.bugGenerations.length > 0);
</script>
