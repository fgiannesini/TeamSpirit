<template>
  <h4 data-testid="title" class="max">Period {{ id }}</h4>
  <input data-testid="start-date-input" type="date"/>
</template>
<script setup lang="ts">
defineProps<{ id: number }>()
</script>