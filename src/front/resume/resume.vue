<script setup lang="ts">
import { useFormStore } from '../form-store.ts';

const formStore = useFormStore();
</script>
<template>
  <span data-testid="team-mode">{{formStore.$state.teamMode}}</span>
  <span v-for="developer in formStore.developers" :data-testid="'developer-' + developer.id">{{developer.experience}}</span>
  <span data-testid="reviewers">{{formStore.$state.reviewers}}</span>
</template>