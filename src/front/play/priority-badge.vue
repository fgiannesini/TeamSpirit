<script setup lang="ts">
defineProps<{
  priority: number;
  storyId: number;
}>();

const priorityChipClass = (priority: number): string => {
  if (priority >= 5) return 'priority-badge--primary';
  if (priority >= 2) return 'priority-badge--secondary';
  return 'priority-badge--tertiary';
};
</script>

<template>
  <span
    :class="['priority-badge', priorityChipClass(priority)]"
    :data-testid="`priority-${storyId}`"
    :aria-label="`Priority ${priority}`"
  >
    <i aria-hidden="true">flag</i>
    <span>{{ priority }}</span>
  </span>
</template>

<style scoped>
.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.5rem;
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

  &.priority-badge--primary {
    background-color: var(--primary-container);
    color: var(--on-primary-container);
  }

  &.priority-badge--secondary {
    background-color: var(--secondary-container);
    color: var(--on-secondary-container);
  }

  &.priority-badge--tertiary {
    background-color: var(--tertiary-container);
    color: var(--on-tertiary-container);
  }
}
</style>
