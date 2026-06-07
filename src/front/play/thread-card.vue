<script setup lang="ts">
import type { ThreadState, ThreadVue } from './thread.ts';
import StoryCard from './story-card.vue';
import ThreadStateBadge from './thread-state-badge.vue';

defineProps<{
  thread: ThreadVue;
  flashingStoryIds: Set<number>;
}>();

const THREAD_STATE_CLASSES: Record<ThreadState, { state: string; container: string }> = {
  Develop: { state: 'thread--develop', container: 'primary-container' },
  Review: { state: 'thread--review', container: 'secondary-container' },
  Wait: { state: '', container: '' },
};
</script>

<template>
  <div
    :id="`thread${thread.id}`"
    :data-testid="`thread${thread.id}`"
    :class="[
      'thread',
      'border',
      'round',
      thread.presence,
      THREAD_STATE_CLASSES[thread.state].state,
      THREAD_STATE_CLASSES[thread.state].container,
    ]"
  >
    <div class="thread-header">
      <div class="row middle-align">
        <span
          :id="`thread-title-${thread.id}`"
          :data-testid="`thread-title-${thread.id}`"
          class="max"
        >
          {{ thread.name }}
        </span>
        <ThreadStateBadge
          :thread-id="thread.id"
          :state="thread.state"
          :presence="thread.presence"
        />
      </div>
    </div>
    <div
      :id="`thread-user-story-${thread.id}`"
      :data-testid="`thread-user-story-${thread.id}`"
      class="thread-stories"
    >
      <StoryCard
        v-for="story in thread.inProgressStories"
        :key="story.id"
        :data-testid="'user-story-' + story.id + '-' + thread.id"
        :data-flip-id="'story-' + story.id"
        :story="story"
        :flashing="flashingStoryIds.has(story.id)"
        variant="in-progress"
      />
      <StoryCard
        v-for="story in thread.reviewStories"
        :key="'review-' + story.id"
        :data-testid="'user-story-' + story.id + '-' + thread.id"
        :data-flip-id="'story-' + story.id"
        :story="story"
        :flashing="flashingStoryIds.has(story.id)"
        variant="review"
      />
      <p
        v-if="
          thread.inProgressStories.length === 0 &&
          thread.reviewStories.length === 0 &&
          thread.presence !== 'off'
        "
        :data-testid="`thread-idle-${thread.id}`"
        class="small-text italic center-align thread-idle-hint"
      >
        No story assigned
      </p>
    </div>
  </div>
</template>

<style scoped>
.thread {
  margin-bottom: 0.5rem;
  transition:
    border-color 0.3s,
    background-color 0.3s;

  &.thread--develop {
    border-color: var(--primary);
  }

  &.thread--review {
    border-color: var(--secondary);
  }

  &.off {
    opacity: 0.5;
  }
}

.thread-header {
  border-bottom: 1px solid var(--outline-variant);
  padding: 0.5rem 0.75rem;

  .thread--develop & {
    border-bottom-color: var(--primary);
  }

  .thread--review & {
    border-bottom-color: var(--secondary);
  }
}

.thread-stories {
  --story-card-height: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.25rem;
  min-height: calc(2 * var(--story-card-height) + 0.25rem);
  padding: 0.5rem;

  > p {
    margin: 0;
  }

  &:has(> p[data-testid^='thread-idle-']) {
    justify-content: center;
  }
}

.thread-idle-hint {
  opacity: 0.6;
}
</style>
