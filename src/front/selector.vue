<script setup lang="ts">
type SelectorMode = 'random' | 'custom' | undefined;

defineProps<{
  selectorMode: SelectorMode;
}>()

defineEmits(['select']);
</script>
<template>
  <nav>
    <label class="radio">
      <input data-testid="random-radio" type="radio" name="team" @click="$emit('select', 'random')" :checked="selectorMode === 'random'">
      <span>Random</span>
    </label>
    <label class="radio">
      <input data-testid="custom-radio" type="radio" name="team" @click="$emit('select', 'custom')" :checked="selectorMode === 'custom'">
      <span>Custom</span>
    </label>
  </nav>
</template>
