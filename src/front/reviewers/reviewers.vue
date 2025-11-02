<template>
  <fieldset class="medium-width">
    <legend data-testid="title">Reviewers</legend>
    <div class="space"/>
    <slider
      :min="0"
      :max="formStore.developers.length-1"
      v-model:value="formStore.reviewers"
    />
  </fieldset>
</template>
<script setup lang="ts">
import { useFormStore } from '../form-store.ts';
import Slider from '../slider.vue';

const formStore = useFormStore();
</script>
