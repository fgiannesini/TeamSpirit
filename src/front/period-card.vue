<template>
  <h4 data-testid="title" class="max">Period {{ id }}</h4>
</template>
<script setup lang="ts">
defineProps<{ id: number }>()
</script>