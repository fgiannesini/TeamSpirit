<script setup lang="ts">
import { computed, type InputHTMLAttributes } from 'vue';
import type { UserStory } from '../form-store.ts';
import RemoveButton from '../shared/remove-button.vue';
import Slider from '../shared/slider.vue';

const props = defineProps<{
  id: number;
  date: Date;
  userStories: UserStory[];
  selectedUserStories: UserStory[];
  priority: number;
}>();
const emit = defineEmits<{
  (e: 'update:date', value: Date): void;
  (e: 'update:selected-user-stories', value: UserStory[]): void;
  (e: 'update:priority', value: number): void;
  (e: 'remove'): void;
}>();

const userStoriesToDisplay = computed(() => {
  const selectedIds = props.selectedUserStories.map((us) => us.id);
  return props.userStories.filter((us) => !selectedIds.includes(us.id));
});

const addUserStory = (userStory: UserStory): void => {
  emit('update:selected-user-stories', [...props.selectedUserStories, userStory]);
};

const removeUserStory = (userStoryToRemove: UserStory): void => {
  emit(
    'update:selected-user-stories',
    props.selectedUserStories.filter((us) => us.id !== userStoryToRemove.id),
  );
};
</script>
<template>
  <article class="medium-width">
    <nav>
      <h4 data-testid="title" class="max small">Priority change {{ id }}</h4>
      <remove-button @click="$emit('remove')" />
    </nav>
    <div class="field label suffix border round small">
      <select>
        <option data-testid="us-default-option">Select a user story</option>
        <option
          v-for="us in userStoriesToDisplay"
          :key="us.id"
          :data-testid="`us-select-item-${us.id}`"
          @click="addUserStory(us)"
        >
          {{ `User story ${us.id} - prio ${us.priority}` }}
        </option>
      </select>
      <label data-testid="us-label">User stories</label>
      <i>arrow_drop_down</i>
      <output>
        <button
          class="chip"
          v-for="us in selectedUserStories"
          :key="us.id"
          :data-testid="`us-selected-button-${us.id}`"
          @click="removeUserStory(us)"
        >
          <span :data-testid="`us-selected-label-${us.id}`">{{
            `User story ${us.id} - prio ${us.priority}`
          }}</span>
          <i>close</i>
        </button>
      </output>
    </div>
    <div class="field label border fill">
      <input
        data-testid="date-input"
        type="date"
        :value="date.toISOString().split('T')[0]"
        @input="$emit('update:date', new Date(($event.target as InputHTMLAttributes).value))"
      />
      <label data-testid="date-label">Date</label>
    </div>
    <Slider :min="1" :max="10" :value="priority" @update:value="$emit('update:priority', $event)" />
  </article>
</template>
