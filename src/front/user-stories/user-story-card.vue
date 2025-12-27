<script setup lang="ts">
import RemoveButton from '../remove-button.vue';
import Slider from '../slider.vue';

defineEmits(['remove', 'update:complexity']);
defineProps<{
  id: number;
  complexity: number;
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
          :min="1"
          :max="10"
          :value="complexity"
          @update:value="$emit('update:complexity', $event)"
      />
    </fieldset>
  </article>
</template>