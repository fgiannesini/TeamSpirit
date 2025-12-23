<template>
  <article class="medium middle-align center-align" data-testid="empty-state">
    <div>
      <i class="extra">group_remove</i>
      <h5>No team modification exists</h5>
      <div class="medium-space"></div>
      <add-button text="Add a team modification" @click="addTeamModification"/>
    </div>
  </article>
</template>
<script setup lang="ts">
import AddButton from '../add-button.vue';
import { useFormStore } from '../form-store.ts';

const store = useFormStore();
const addTeamModification = (): void => {
  store.generateTeamModification();
};
</script>
