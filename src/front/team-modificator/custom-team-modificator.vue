<template>
  <article
      class="medium middle-align center-align"
      data-testid="empty-state"
  >
    <div>
      <i class="extra">group_remove</i>
      <h5>No team modification exists</h5>
      <div class="medium-space"></div>
      <add-button text="Add a team modification"/>
    </div>
  </article>
  <PeriodCard :id="0"/>
</template>
<script setup lang="ts">
import PeriodCard from "../period-card.vue";
import AddButton from "../add-button.vue";
</script>