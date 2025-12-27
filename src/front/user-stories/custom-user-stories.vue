<script setup lang="ts">
import AddButton from '../add-button.vue';
import { useFormStore } from '../form-store.ts';
import UserStoryCard from './user-story-card.vue';

const store = useFormStore();
const addUserStory = (): void => {
  store.generateUserStory();
};
const removeUserStory = (targetId: number): void => {
  store.removeUserStory(targetId);
};
const hasUserStories = () => store.userStories.length > 0;
</script>

<template>
  <div v-if="hasUserStories()" data-testid="setting-state">
    <add-button text="Add a user story" @click="addUserStory"/>
    <div class="grid">
      <div class="s12 m6 l4" v-for="userStory in store.userStories">
        <user-story-card
            :id="userStory.id"
            :complexity="1"
            :review-complexity="1"
            :priority="1"
            :data-testid="'user-story-card-' + userStory.id"
            @remove="removeUserStory(userStory.id)"
        ></user-story-card>
      </div>
    </div>
  </div>
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