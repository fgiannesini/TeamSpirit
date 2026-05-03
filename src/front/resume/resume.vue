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
  <article>
    <nav>
      <i>groups</i>
      <span class="max">Équipe</span>
      <span class="chip" data-testid="team-mode">{{ teamModeLabel }}</span>
    </nav>
    <div v-if="formStore.teamMode === 'custom'" class="wrap">
      <button
        class="chip"
        v-for="developer in formStore.developers"
        :key="developer.id"
        :data-testid="'developer-' + developer.id"
      >
        Dev {{ developer.id }} — exp. {{ developer.experience }}
      </button>
    </div>
    <nav v-if="formStore.teamMode !== 'notSet'">
      <i>rate_review</i>
      <span class="max">Reviewers</span>
      <span class="chip" data-testid="reviewers">{{ formStore.reviewers }}</span>
    </nav>
  </article>
</template>
