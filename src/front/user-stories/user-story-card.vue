<script setup lang="ts">
import RemoveButton from '../remove-button.vue';
import Slider from '../slider.vue';

defineEmits(['remove', 'update:complexity', 'update:review-complexity']);
defineProps<{
  id: number;
  complexity: number;
  reviewComplexity: number;
}>();
</script>

<template>
  <article class="medium-width">
    <nav>
      <h4 data-testid="title" class="max">User story {{ id }}</h4>
      <remove-button @click="$emit('remove')"/>
    </nav>
    <div class="space"/>
    <fieldset>
      <legend data-testid="complexity-label">Complexity</legend>
      <div class="space"/>
      <slider
          data-testid="complexity-slider"
          :min="1"
          :max="10"
          :value="complexity"
          @update:value="$emit('update:complexity', $event)"
      />
    </fieldset>
    <div class="space"/>
    <fieldset>
      <legend data-testid="review-complexity-label">Review complexity</legend>
      <div class="space"/>
      <slider
          data-testid="review-complexity-slider"
          :min="1"
          :max="9"
          :value="reviewComplexity"
          @update:value="$emit('update:review-complexity', $event)"
      />
    </fieldset>
  </article>
</template>