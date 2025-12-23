<template>
  <div class="grid">
    <div class="s12 m6 l4" v-for="teamModificator in store.teamModificators">
      <PeriodCard
        :id="teamModificator.id"
        :data-testid="'team-modificator-' + teamModificator.id"
      ></PeriodCard>
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
      <add-button text="Add a team modification" @click="addTeamModification"/>
    </div>
  </article>
</template>
<script setup lang="ts">
import AddButton from '../add-button.vue';
import { useFormStore } from '../form-store.ts';
import PeriodCard from '../period-card.vue';

const store = useFormStore();
const addTeamModification = (): void => {
  store.generateTeamModification();
};
const hasTeamModificators = () => store.teamModificators.length > 0;
</script>
