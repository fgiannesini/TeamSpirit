<template>
  <article class="medium-width">
    <nav>
      <h4 data-testid="title" class="max">Period {{ id }}</h4>
      <remove-button @click="$emit('remove')"/>
    </nav>
    <div class="space"/>
    <div class="field">
      <label data-testid="dev-label">Developers</label>
      <button>
        <span data-testid="dev-select-label">Select a developer</span>
        <i>arrow_drop_down</i>
        <menu>
          <li
            v-for="developer in developersToDisplay"
            :key="developer.id"
            :data-testid="`dev-select-item-${developer.id}`"
            @click="$emit('update:select-developer', developer)"
          >
            {{ `Developer ${developer.id} - XP ${developer.experience}` }}
          </li>
        </menu>
      </button>
    </div>
    <button
      class="chip"
      v-for="developer in selectedDevelopers"
      :key="developer.id"
    >
      <span data-testid="dev-selected-chip-0"
        >{{ `Developer ${developer.id} - XP ${developer.experience}` }}</span
      >
      <i>close</i>
    </button>
    <div class="field label border fill">
      <input
        data-testid="start-date-input"
        type="date"
        :value="periodStart.toISOString().split('T')[0]"
        @input="$emit('update:period-start', new Date(($event.target as InputHTMLAttributes).value))"
      >
      <label data-testid="start-date-label">Start</label>
    </div>
    <div class="field label border fill">
      <input
        data-testid="end-date-input"
        type="date"
        :value="periodEnd.toISOString().split('T')[0]"
        @input="$emit('update:period-end', new Date(($event.target as InputHTMLAttributes).value))"
      >
      <label data-testid="end-date-label">End</label>
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed, type InputHTMLAttributes } from 'vue';
import type { Developer } from './form-store.ts';
import RemoveButton from './remove-button.vue';

const props = defineProps<{
  id: number;
  periodStart: Date;
  periodEnd: Date;
  developers: Developer[];
  selectedDevelopers: Developer[];
}>();
defineEmits([
  'update:period-start',
  'update:period-end',
  'remove',
  'update:select-developer',
]);

const developersToDisplay = computed(() => {
  const selectedIds = props.selectedDevelopers.map((d) => d.id);
  return props.developers.filter(
    (developer) => !selectedIds.includes(developer.id),
  );
});
</script>
