<template>
  <article class ="medium-width">
    <h3 data-testid="title">Developer {{id}}</h3>
    <button class="small-round small secondary" data-testid="remove-button" @click="$emit('remove')">
      <i>remove</i>
      <span>Remove</span>
    </button>
    <fieldset>
      <legend data-testid="experience-label">Experience</legend>
      <nav>
      <span data-testid="experience-minimum">{{min}}</span>
      <label class="slider" data-testid="experience-range">
        <input type="range" value="3" :min="min" :max="max">
        <span></span>
        <div class="tooltip" data-testid=experience-range-tooltip></div>
      </label>
      <span data-testid="experience-maximum">{{max}}</span>
      </nav>
    </fieldset>
  </article>
</template>
<script setup lang="ts">
defineProps<{ id: number }>();
const min = 1;
const max = 7;
</script>
<style lang="scss" scoped>
.slider > .tooltip {
  visibility: visible!important;
  inset-block-start: -1rem !important;
  opacity: 1 !important;
}
</style>