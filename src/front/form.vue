<template>
  <main class="responsive">
    <button class="small-round extra" data-testid="add-developer-button" @click="addDeveloper">
      <i>add</i>
      <span>Add a developer</span>
    </button>
    <developer-card :id="1" data-testid="developer-card-1">
    </developer-card>
    <developer-card :id="2" data-testid="developer-card-2">
    </developer-card>
  </main>
</template>
<script setup lang="ts">
import DeveloperCard from './developer-card.vue';

const addDeveloper = () => {
}
</script>