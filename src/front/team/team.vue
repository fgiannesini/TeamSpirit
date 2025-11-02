<script setup lang="ts">
import { useFormStore } from '../form-store.ts';
import Selector from '../selector.vue';
import CustomTeam from './custom-team.vue';

const formStore = useFormStore();
</script>
<template>
  <Selector v-model:selectedMode="formStore.teamMode">
    <CustomTeam></CustomTeam>
  </Selector>
</template>
