<script setup lang="ts">
import {useFormStore} from "../form-store.ts";

const formStore = useFormStore();
</script>
<template>
  <span data-testid="team-mode">{{formStore.$state.teamMode}}</span>
</template>