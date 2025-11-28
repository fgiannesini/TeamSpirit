<script setup lang="ts">

defineProps<{text: string}>()
</script>

<template>
  <button
      class="small-round extra"
      data-testid="add-button"
  >
    <i>add</i>
    <span  data-testid="add-button-text">{{ text}}</span>
  </button>

</template>