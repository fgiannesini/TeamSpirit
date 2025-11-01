<script setup lang="ts">
import { useFormStore } from '../form-store.ts';
import CustomTeam from './custom-team.vue';
import Selector from '../selector.vue';

const formStore = useFormStore();
</script>
<template>
  <Selector v-model:selectedMode="formStore.teamMode"/>
  <div data-testid="custom-container" :class="[formStore.teamMode === 'custom'?'active' : '', 'page', 'padding']">
    <CustomTeam></CustomTeam>
  </div>
</template>
