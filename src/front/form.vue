<template>
  <main class="responsive">
    <button class="small-round extra" data-testid="add-developer-button">
      <i>add</i>
      <span>Add a developer</span>
    </button>
    <developer-card data-testid="developer-card">
    </developer-card>
  </main>
</template>
<script setup lang="ts">
import DeveloperCard from './developer-card.vue';
</script>