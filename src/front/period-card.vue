<template>
  <article class="medium-width">
    <nav>
      <h4 data-testid="title" class="max">Period {{ id }}</h4>
      <remove-button @click="$emit('remove')"/>
    </nav>
    <div class="space"/>
    <div class="field">
      <label data-testid="dev-label">Developers</label>
      <button>
        <span data-testid="dev-select-label">Select a developer</span>
        <i>arrow_drop_down</i>
      </button>
    </div>
    <div class="field label border fill">
      <input
        data-testid="start-date-input"
        type="date"
        :value="periodStart.toISOString().split('T')[0]"
        @input="$emit('update:period-start', new Date(($event.target as InputHTMLAttributes).value))"
      >
      <label data-testid="start-date-label">Start</label>
    </div>
    <div class="field label border fill">
      <input
        data-testid="end-date-input"
        type="date"
        :value="periodEnd.toISOString().split('T')[0]"
        @input="$emit('update:period-end', new Date(($event.target as InputHTMLAttributes).value))"
      >
      <label data-testid="end-date-label">End</label>
    </div>
  </article>
</template>
<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue';
import RemoveButton from './remove-button.vue';

defineProps<{ id: number; periodStart: Date; periodEnd: Date }>();
defineEmits(['update:period-start', 'update:period-end', 'remove']);
</script>
