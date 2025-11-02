<template>
  <article class="medium-width">
    <nav>
      <h4 data-testid="title" class="max">Developer {{ id }}</h4>
      <button
        class="small-round small secondary"
        data-testid="remove-button"
        @click="$emit('remove')"
      >
        <i>remove</i>
        <span>Remove</span>
      </button>
    </nav>
    <div class="space"/>
    <fieldset>
      <legend data-testid="experience-label">Experience</legend>
      <div class="space"/>
      <slider
        :min="1"
        :max="7"
        :value="experience"
        @update:value="$emit('update:experience', $event)"
      />
    </fieldset>
  </article>
</template>
<script setup lang="ts">
import Slider from '../slider.vue';

defineProps<{ id: number; experience: number }>();
defineEmits(['update:experience', 'remove']);
</script>
