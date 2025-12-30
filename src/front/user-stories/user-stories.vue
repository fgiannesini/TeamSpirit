<script setup lang="ts">
import {useFormStore} from '../form-store.ts';
import Selector from '../shared/selector.vue';
import CustomUserStories from './custom-user-stories.vue';

const store = useFormStore();
</script>

<template>
  <Selector v-model:selectedMode="store.userStoriesMode" :mandatory="true"><CustomUserStories></CustomUserStories></Selector>
</template>
