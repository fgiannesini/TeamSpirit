<script setup lang="ts">
import AddButton from '../add-button.vue';
import { useFormStore } from '../form-store.ts';

const store = useFormStore();
const addUserStory = (): void => {
  store.generateUserStory();
};
const hasUserStories = () => store.userStories.length > 0;
</script>

<template>
  <article
      v-if="!hasUserStories()"
      class="medium middle-align center-align"
      data-testid="empty-state"
  >
    <div>
      <i class="extra">groups</i>
      <h5>Your don't have a user story</h5>
      <div class="medium-space"></div>
      <add-button text="Add a developer" @click="addUserStory"/>
    </div>
  </article>
</template>