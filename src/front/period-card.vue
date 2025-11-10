<template>
  <h4 data-testid="title" class="max">Period {{ id }}</h4>
  <input data-testid="start-date-input" type="date"/>
  <label data-testid="start-date-label">Start</label>
</template>
<script setup lang="ts">
defineProps<{ id: number }>()
</script>