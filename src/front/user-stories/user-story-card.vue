<script setup lang="ts">
import RemoveButton from '../remove-button.vue';

defineProps<{
  id: number;
}>();
</script>

<template>
  <article class="medium-width">
    <nav>
      <h4 data-testid="title" class="max">User story {{ id }}</h4>
      <remove-button @click="$emit('remove')"/>
    </nav>
  </article>
</template>