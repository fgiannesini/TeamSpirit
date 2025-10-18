<template>
  <fieldset class="medium-width">
    <legend data-testid="title">Reviewers</legend>
    <div class="space"/>
    <slider :min="0" :max="formStore.developers.length-1" :value="formStore.reviewers"/>
  </fieldset>
</template>
<script setup lang="ts">
import Slider from "../slider.vue";
import {useFormStore} from "../form-store.ts";

const formStore = useFormStore();
</script>