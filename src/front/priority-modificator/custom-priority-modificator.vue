<template>
  <div v-if="hasPriorityModificators" data-testid="setting-state">
    <add-button text="Add a priority modification" @click="addPriorityModificator" />
    <div class="grid">
      <div
        class="s12 m6 l4"
        v-for="priorityModificator in store.priorityModificators"
        :key="priorityModificator.id"
      >
        <PriorityCard
          :id="priorityModificator.id"
          :data-testid="`priority-modificator-${priorityModificator.id}`"
          :userStories="store.userStories"
          v-model:date="priorityModificator.date"
          v-model:selected-user-stories="priorityModificator.selectedUserStories"
          v-model:priority="priorityModificator.priority"
          @remove="removePriorityModificator(priorityModificator.id)"
        />
      </div>
    </div>
  </div>
  <article v-else class="medium middle-align center-align" data-testid="empty-state">
    <div>
      <i class="extra">priority_high</i>
      <h5>No priority modification exists</h5>
      <div class="medium-space"></div>
      <add-button text="Add a priority modification" @click="addPriorityModificator" />
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useFormStore } from '../form-store.ts';
import AddButton from '../shared/add-button.vue';
import PriorityCard from './priority-card.vue';

const store = useFormStore();
const addPriorityModificator = (): void => {
  store.generatePriorityModification();
};
const removePriorityModificator = (targetId: number): void => {
  store.removePriorityModification(targetId);
};
const hasPriorityModificators = computed(() => store.priorityModificators.length > 0);
</script>
