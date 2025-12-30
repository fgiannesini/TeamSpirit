<template>
  <article class="medium-width">
    <nav>
      <h4 data-testid="title" class="max small">Developer {{ id }}</h4>
      <remove-button @click="$emit('remove')"/>
    </nav>
    <fieldset>
      <legend data-testid="experience-label">Experience</legend>
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
import RemoveButton from '../shared/remove-button.vue';
import Slider from '../shared/slider.vue';

defineProps<{ id: number; experience: number }>();
defineEmits(['update:experience', 'remove']);
</script>
