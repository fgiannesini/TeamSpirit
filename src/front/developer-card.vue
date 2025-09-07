<template>
  <article class ="medium-width">
    <button class="small-round small secondary" data-testid="remove-button" @click="$emit('remove')">
      <i>remove</i>
      <span>Remove</span>
    </button>
    <fieldset>
      <legend data-testid="experience-label">Experience</legend>
      <nav>
      <span data-testid="experience-minimum">1</span>
      <label class="slider" data-testid="experience-range">
        <input type="range" value="3" min="1" max="7">
        <span></span>
        <div class="tooltip" data-testid=experience-range-tooltip></div>
      </label>
      <span data-testid="experience-maximum">7</span>
      </nav>
    </fieldset>
  </article>
</template>
<script setup lang="ts">
</script>
<style lang="scss" scoped>
.slider > .tooltip {
  visibility: visible!important;
  inset-block-start: -1rem !important;
  opacity: 1 !important;
}
</style>