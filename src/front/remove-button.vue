<script setup lang="ts">

</script>

<template>
  <button
      class="small-round small secondary"
      data-testid="remove-button"
      @click="$emit('remove')"
  >
    <i>remove</i>
    <span>Remove</span>
  </button>
</template>
