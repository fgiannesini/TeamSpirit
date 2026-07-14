<script setup lang="ts">
import { useFormStore } from '../form-store.ts';
import Selector from '../shared/selector.vue';
import CustomBugGenerator from './custom-bug-generator.vue';

const store = useFormStore();
</script>
<template>
  <Selector v-model:selectedMode="store.bugGeneratorMode" :mandatory="false">
    <CustomBugGenerator />
  </Selector>
</template>
