<script setup lang="ts">
import { useFormStore } from '../form-store.ts';
import Selector from '../shared/selector.vue';
import CustomPriorityModificator from './custom-priority-modificator.vue';

const store = useFormStore();
</script>
<template>
  <Selector v-model:selectedMode="store.priorityModificatorMode" :mandatory="false">
    <CustomPriorityModificator />
  </Selector>
</template>
