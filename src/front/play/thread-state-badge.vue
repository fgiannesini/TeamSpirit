<script setup lang="ts">
import { computed } from 'vue';
import type { ThreadPresence, ThreadState } from './thread.ts';

type BadgeLabel = ThreadState | 'Off';

const props = defineProps<{
  threadId: number;
  state: ThreadState;
  presence: ThreadPresence;
}>();

const BADGE_VARIANT: Partial<Record<BadgeLabel, string>> = {
  Develop: 'thread-state-badge--develop',
  Review: 'thread-state-badge--review',
};

const ICON: Record<BadgeLabel, string> = {
  Wait: 'pause',
  Develop: 'code',
  Review: 'rate_review',
  Off: 'power_settings_new',
};

const TOOLTIP: Record<BadgeLabel, string> = {
  Wait: 'Waiting for work',
  Develop: 'Developing a user story',
  Review: 'Reviewing a user story',
  Off: 'Thread is unavailable',
};

const label = computed((): BadgeLabel => (props.presence === 'off' ? 'Off' : props.state));
</script>

<template>
  <span
    :id="`thread-state-${threadId}`"
    :data-testid="`thread-state-${threadId}`"
    :class="['thread-state-badge', BADGE_VARIANT[label]]"
    :title="TOOLTIP[label]"
    role="status"
    aria-live="polite"
  >
    <i aria-hidden="true" :data-testid="`thread-state-icon-${threadId}`">{{ ICON[label] }}</i>
    <span :data-testid="`thread-state-label-${threadId}`">{{ label }}</span>
  </span>
</template>

<style scoped>
.thread-state-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.625rem;
  block-size: 1.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.75rem;
  user-select: none;
  background-color: var(--surface-container-highest);
  color: var(--on-surface-variant);

  > i {
    font-size: 0.875rem;
  }

  &.thread-state-badge--develop {
    background-color: var(--primary-container);
    color: var(--on-primary-container);
  }

  &.thread-state-badge--review {
    background-color: var(--secondary-container);
    color: var(--on-secondary-container);
  }
}
</style>
