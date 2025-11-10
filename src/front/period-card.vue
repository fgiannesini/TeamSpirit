<template>
  <article class="medium-width">
    <nav>
      <h4 data-testid="title" class="max">Period {{ id }}</h4>
    </nav>
    <div class="space"/>
    <div class="field label border fill">
      <input data-testid="start-date-input" type="date"/>
      <label data-testid="start-date-label">Start</label>
    </div>
    <div class="field label border fill">
      <input data-testid="end-date-input" type="date"/>
      <label data-testid="end-date-label">End</label>
    </div>
  </article>
</template>
<script setup lang="ts">
defineProps<{ id: number }>()
</script>