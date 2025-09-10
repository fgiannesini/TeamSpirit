<script setup lang="ts">
import DeveloperCard from './developer-card.vue';
import {ref} from "vue";

const ids = ref<number[]>([]);
const addDeveloper = () => {
  ids.value = [...ids.value, ids.value.length];
}
const removeDeveloper= (targetId: number) => {
  ids.value = ids.value.filter(id => id !== targetId);
}
</script>
<template>
  <main class="responsive">
    <button class="small-round extra" data-testid="add-developer-button" @click="addDeveloper">
      <i>add</i>
      <span>Add a developer</span>
    </button>
    <div class="grid">
      <div class="s12 m6 l4" v-for="id in ids">
        <developer-card :id="id" :data-testid="'developer-card-' + id" @remove="removeDeveloper(id)"></developer-card>
      </div>
    </div>
  </main>
</template>