<template>
  <div v-if="hasTeamModificators()" data-testid="setting-state">
    <add-button text="Add a team modification" @click="addTeamModificator"/>
    <div class="grid">
      <div class="s12 m6 l4" v-for="teamModificator in store.teamModificators">
        <PeriodCard
          :id="teamModificator.id"
          :data-testid="`team-modificator-${teamModificator.id}`"
          :developers="store.developers"
          v-model:period="teamModificator.period"
          v-model:selected-developers="teamModificator.selectedDevelopers"
          @remove="removeTeamModificator(teamModificator.id)"
        ></PeriodCard>
      </div>
    </div>
  </div>
  <article
    v-if="!hasTeamModificators()"
    class="medium middle-align center-align"
    data-testid="empty-state"
  >
    <div>
      <i class="extra">group_remove</i>
      <h5>No team modification exists</h5>
      <div class="medium-space"></div>
      <add-button text="Add a team modification" @click="addTeamModificator"/>
    </div>
  </article>
</template>
<script setup lang="ts">
import AddButton from '../shared/add-button.vue';
import {useFormStore} from '../form-store.ts';
import PeriodCard from './period-card.vue';

const store = useFormStore();
const addTeamModificator = (): void => {
  store.generateTeamModification();
};
const removeTeamModificator = (targetId: number): void => {
  store.removeTeamModification(targetId);
};
const hasTeamModificators = () => store.teamModificators.length > 0;
</script>
