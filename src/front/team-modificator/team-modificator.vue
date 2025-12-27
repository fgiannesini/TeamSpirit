<script setup lang="ts">
import { useFormStore } from '../form-store.ts';
import Selector from '../selector.vue';
import CustomTeamModificator from './custom-team-modificator.vue';

const store = useFormStore();
</script>
<template>
  <Selector v-model:selectedMode="store.teamModificatorMode" :mandatory="false">
    <CustomTeamModificator/>
  </Selector>
</template>
