<template>
  <article class="medium-width">
    <nav>
      <h4 data-testid="title" class="max">Developer {{ id }}</h4>
      <button class="small-round small secondary" data-testid="remove-button" @click="$emit('remove')">
        <i>remove</i>
        <span>Remove</span>
      </button>
    </nav>
    <div class="space"></div>
    <fieldset>
      <legend data-testid="experience-label">Experience</legend>
      <nav>
        <span data-testid="experience-minimum">{{ min }}</span>
        <label class="slider" data-testid="experience-range">
          <input data-testid="experience-input" type="range" :value="experience"
                 @input="$emit('update:experience', Number(($event.target as InputHTMLAttributes).value))" :min="min" :max="max">
          <span></span>
          <div class="tooltip" data-testid=experience-range-tooltip></div>
        </label>
        <span data-testid="experience-maximum">{{ max }}</span>
      </nav>
    </fieldset>
  </article>
</template>
<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue';

defineProps<{ id: number, experience: number }>();
defineEmits(['update:experience', 'remove']);
const min = 1;
const max = 7;
</script>
<style lang="scss" scoped>
.slider > .tooltip {
  visibility: visible !important;
  inset-block-start: -1rem !important;
  opacity: 1 !important;
}
</style>