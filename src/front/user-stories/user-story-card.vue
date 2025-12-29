<script setup lang="ts">
import RemoveButton from '../remove-button.vue';
import Slider from '../slider.vue';

defineEmits([
  'remove',
  'update:complexity',
  'update:review-complexity',
  'update:priority',
]);
defineProps<{
  id: number;
  complexity: number;
  reviewComplexity: number;
  priority: number;
}>();
</script>

<template>
  <article class="medium-width">
    <nav>
      <h4 data-testid="title" class="small max">User story {{ id }}</h4>
      <remove-button @click="$emit('remove')"/>
    </nav>
    <fieldset>
      <legend data-testid="complexity-label">Complexity</legend>
      <slider
          data-testid="complexity-slider"
          :min="1"
          :max="10"
          :value="complexity"
          @update:value="$emit('update:complexity', $event)"
      />
    </fieldset>
    <fieldset>
      <legend data-testid="review-complexity-label">Review complexity</legend>
      <slider
          data-testid="review-complexity-slider"
          :min="1"
          :max="10"
          :value="reviewComplexity"
          @update:value="$emit('update:review-complexity', $event)"
      />
    </fieldset>
    <fieldset>
      <legend data-testid="priority-label">Priority</legend>
      <slider
          data-testid="priority-slider"
          :min="1"
          :max="10"
          :value="priority"
          @update:value="$emit('update:priority', $event)"
      />
    </fieldset>
  </article>
</template>