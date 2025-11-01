<script setup lang="ts">

import type { SelectorMode } from './form-store.ts';

defineProps<{
  selectedMode: SelectorMode;
}>()

defineEmits(['update:selectedMode']);
</script>
<template>
  <nav>
    <label class="radio">
      <input data-testid="random-radio" type="radio" name="team" @click="$emit('update:selectedMode', 'random')" :checked="selectedMode === 'random'">
      <span>Random</span>
    </label>
    <label class="radio">
      <input data-testid="custom-radio" type="radio" name="team" @click="$emit('update:selectedMode', 'custom')" :checked="selectedMode === 'custom'">
      <span>Custom</span>
    </label>
  </nav>
</template>
