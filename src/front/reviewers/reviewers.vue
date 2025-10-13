<template>
  <slider :min="0" :max="formStore.developers.length-1" :value="0"/>
</template>
<script setup lang="ts">
import Slider from "../slider.vue";
import {useFormStore} from "../form-store.ts";

const formStore = useFormStore();
</script>