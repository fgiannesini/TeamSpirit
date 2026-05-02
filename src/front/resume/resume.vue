<script setup lang="ts">
import { computed } from 'vue';
import { useFormStore } from '../form-store.ts';

const formStore = useFormStore();

const teamModeLabel = computed(() => {
  switch (formStore.teamMode) {
    case 'random':
      return 'Random';
    case 'custom':
      return 'Custom';
    case 'notSet':
      return 'Not set';
  }
});
</script>
<template>
  <span data-testid="team-mode">{{ teamModeLabel }}</span>
  <ul v-if="formStore.teamMode === 'custom'">
    <li
      v-for="developer in formStore.developers"
      :key="developer.id"
      :data-testid="'developer-' + developer.id"
    >
      Dev {{ developer.id }} — exp. {{ developer.experience }}
    </li>
  </ul>
  <span data-testid="reviewers">{{ formStore.$state.reviewers }}</span>
</template>
