<template>
  <article>
    <button class="small-round extra" data-testid="remove-button" @click="$emit('remove')">
      <i>remove</i>
      <span>Remove</span>
    </button>
    <label class="slider" data-testid="experience-range">
      <input type="range" value="3" min="1" max="7">
      <span></span>
      <div class="tooltip"></div>
    </label>

  </article>
</template>
<script setup lang="ts">
</script>