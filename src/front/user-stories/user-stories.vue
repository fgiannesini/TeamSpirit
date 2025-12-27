<script setup lang="ts">
import { useFormStore } from '../form-store.ts';
import Selector from '../selector.vue';

const store = useFormStore();
</script>

<template>
  <Selector v-model:selectedMode="store.userStoriesMode" :mandatory="false"></Selector>
</template>
