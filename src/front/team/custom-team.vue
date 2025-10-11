<script setup lang="ts">
import { ref } from 'vue';
import DeveloperCard from './developer-card.vue';

const ids = ref<number[]>([]);
const addDeveloper = (): void => {
  const max = ids.value.length ? Math.max(...ids.value) + 1 : 0;
  ids.value = [...ids.value, max];
};
const removeDeveloper = (targetId: number): void => {
  ids.value = ids.value.filter((id) => id !== targetId);
};

const hasDevelopers = () => ids.value.length > 0;
</script>
<template>
  <div v-if="hasDevelopers()" data-testid="setting-state">
    <button class="small-round extra" data-testid="add-developer-button" @click="addDeveloper">
      <i>add</i>
      <span>Add a developer</span>
    </button>
    <div class="grid">
      <div class="s12 m6 l4" v-for="id in ids">
        <developer-card :id="id" :data-testid="'developer-card-' + id" @remove="removeDeveloper(id)"></developer-card>
      </div>
    </div>
  </div>
  <article v-if="!hasDevelopers()" class="medium middle-align center-align" data-testid="empty-state">
    <div>
      <i class="extra">groups</i>
      <h5>Your team is empty</h5>
      <div class="medium-space"></div>
      <button class="small-round extra" data-testid="add-developer-button" @click="addDeveloper">
        <i>add</i>
        <span>Add a developer</span>
      </button>
    </div>
  </article>
</template>