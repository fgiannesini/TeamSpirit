<script setup lang="ts">
import type { UserStoryVue } from './thread.ts';
import PriorityBadge from './priority-badge.vue';

defineProps<{
  story: UserStoryVue;
  flashing: boolean;
  variant: 'default' | 'in-progress' | 'review' | 'done';
}>();
</script>

<template>
  <div
    :class="[
      'story-card',
      'row',
      'middle-align',
      'small-padding',
      'round',
      'border',
      variant !== 'done' && 'surface-variant',
      variant === 'review' && 'story-card--review',
      variant === 'done' && 'story-card--done',
      variant === 'done' && 'primary-container',
      { 'priority-flash': flashing },
    ]"
  >
    <i
      v-if="variant === 'in-progress'"
      class="small"
      aria-hidden="true"
      data-testid="story-state-icon"
      >code</i
    >
    <i
      v-else-if="variant === 'review'"
      class="small"
      aria-hidden="true"
      data-testid="story-state-icon"
      >rate_review</i
    >
    <i
      v-else-if="variant === 'done'"
      class="small"
      aria-hidden="true"
      data-testid="story-state-icon"
      >check_circle</i
    >
    <span class="max" data-testid="story-name" :title="`#${story.id}`">{{ story.name }}</span>
    <priority-badge
      v-if="story.priority !== null"
      :priority="story.priority"
      :story-id="story.id"
    />
  </div>
</template>

<style scoped>
.story-card {
  position: relative;
  transition:
    border-color 0.3s,
    background-color 0.3s;

  &.story-card--review {
    border-color: var(--secondary);
  }

  &.story-card--done {
    border-color: var(--primary);

    i {
      color: var(--tertiary);
    }
  }
}

@keyframes priority-flash {
  0%,
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
  40% {
    box-shadow: 0 0 0 3px var(--primary);
  }
}

.priority-flash {
  animation: priority-flash 0.8s ease-in-out;
}
</style>
