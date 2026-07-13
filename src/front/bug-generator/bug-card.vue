<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue';
import RemoveButton from '../shared/remove-button.vue';
import Slider from '../shared/slider.vue';

defineProps<{
  id: number;
  date: Date;
  complexity: number;
  reviewComplexity: number;
  priority: number;
}>();
defineEmits<{
  (e: 'update:date', value: Date): void;
  (e: 'update:complexity', value: number): void;
  (e: 'update:review-complexity', value: number): void;
  (e: 'update:priority', value: number): void;
  (e: 'remove'): void;
}>();
</script>

<template>
  <article class="medium-width">
    <nav>
      <h4 data-testid="title" class="small max">Bug {{ id }}</h4>
      <remove-button @click="$emit('remove')" />
    </nav>
    <div class="field label border fill">
      <input
        data-testid="date-input"
        type="date"
        :value="date.toISOString().split('T')[0]"
        @input="$emit('update:date', new Date(($event.target as InputHTMLAttributes).value))"
      />
      <label data-testid="date-label">Date</label>
    </div>
    <fieldset>
      <legend data-testid="complexity-label">Complexity</legend>
      <slider
        data-testid="complexity-slider"
        :min="1"
        :max="10"
        :value="complexity"
        @update:value="$emit('update:complexity', $event)"
      />
    </fieldset>
    <fieldset>
      <legend data-testid="review-complexity-label">Review complexity</legend>
      <slider
        data-testid="review-complexity-slider"
        :min="1"
        :max="10"
        :value="reviewComplexity"
        @update:value="$emit('update:review-complexity', $event)"
      />
    </fieldset>
    <fieldset>
      <legend data-testid="priority-label">Priority</legend>
      <slider
        data-testid="priority-slider"
        :min="1"
        :max="10"
        :value="priority"
        @update:value="$emit('update:priority', $event)"
      />
    </fieldset>
  </article>
</template>
