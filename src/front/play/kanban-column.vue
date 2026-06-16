<script setup lang="ts">
import type { UserStoryVue } from './thread.ts';
import StoryCard from './story-card.vue';

defineProps<{
  title: string;
  icon: string;
  stories: UserStoryVue[];
  flashingStoryIds: Set<number>;
  variant: 'default' | 'done';
  countTestId: string;
  emptyTestId: string;
  emptyIcon: string;
  emptyText: string;
}>();
</script>

<template>
  <article>
    <nav class="surface-container-high small-padding">
      <i aria-hidden="true">{{ icon }}</i>
      <h6 class="max">{{ title }}</h6>
      <span class="column-count" :data-testid="countTestId" :aria-label="`${title} story count`">
        {{ stories.length }} {{ stories.length > 1 ? 'stories' : 'story' }}
      </span>
    </nav>
    <div v-if="stories.length === 0" :data-testid="emptyTestId" class="center-align padding">
      <i class="extra" aria-hidden="true">{{ emptyIcon }}</i>
      <p>{{ emptyText }}</p>
    </div>
    <div v-else class="column-stories">
      <StoryCard
        v-for="story in stories"
        :key="story.id"
        :data-testid="'user-story-' + story.id"
        :data-flip-id="'story-' + story.id"
        :story="story"
        :flashing="flashingStoryIds.has(story.id)"
        :variant="variant"
      />
    </div>
  </article>
</template>

<style scoped>
article > nav {
  border-bottom: 1px solid var(--outline-variant);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-radius: 0.5rem 0.5rem 0 0;
}

.column-count {
  display: inline-flex;
  align-items: center;
  padding: 0 0.625rem;
  block-size: 1.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--on-surface-variant);
  background-color: var(--surface-container-highest);
  border-radius: 0.75rem;
  user-select: none;
}

.column-stories {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
</style>
