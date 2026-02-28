<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue';

defineProps<{
  min: number;
  max: number;
  value: number;
}>();
defineEmits(['update:value']);
</script>

<template>
  <nav>
    <span data-testid="minimum">{{ min }}</span>
    <label class="slider" data-testid="range">
      <input data-testid="input" type="range" :value="value"
             @input="$emit('update:value', Number(($event.target as InputHTMLAttributes).value))" :min="min" :max="max">
      <span></span>
      <div class="tooltip bottom" data-testid=range-tooltip></div>
    </label>
    <span data-testid="maximum">{{ max }}</span>
  </nav>
</template>