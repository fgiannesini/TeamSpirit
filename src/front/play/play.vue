<script setup lang="ts">
import { useFormStore } from '../form-store.ts';

const props = defineProps<{ id: number }>();
const store = useFormStore();
</script>

<template>
{{store.simulationOutputs[props.id].teamType}}
</template>