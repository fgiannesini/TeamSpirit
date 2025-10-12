<script setup lang="ts">
import { useFormStore } from '../form-store.ts';
import DeveloperCard from './developer-card.vue';

const store = useFormStore();
const addDeveloper = (): void => {
  store.generateDeveloper();
};
const removeDeveloper = (targetId: number): void => {
  store.removeDeveloper(targetId);
};

const hasDevelopers = () => store.developers.length > 0;
</script>
<template>
  <div v-if="hasDevelopers()" data-testid="setting-state">
    <button class="small-round extra" data-testid="add-developer-button" @click="addDeveloper">
      <i>add</i>
      <span>Add a developer</span>
    </button>
    <div class="grid">
      <div class="s12 m6 l4" v-for="developer in store.developers">
        <developer-card :id="developer.id" :experience="developer.experience" :data-testid="'developer-card-' + developer.id"
                        @remove="removeDeveloper(developer.id)"></developer-card>
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