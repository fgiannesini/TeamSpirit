<script setup lang="ts">
import { computed } from 'vue';
import type { SelectorMode } from '../form-store.ts';

const props = defineProps<{
  icon: string;
  label: string;
  mode: SelectorMode;
  mandatory?: boolean;
}>();

const modeLabels: Record<SelectorMode, string> = {
  random: 'Random',
  custom: 'Custom',
  notSet: 'Not set',
};

const modeLabel = computed(() => modeLabels[props.mode]);
</script>
<template>
  <template v-if="mandatory || mode !== 'notSet'">
    <nav>
      <i>{{ icon }}</i>
      <span class="max">{{ label }}</span>
      <span class="chip" data-testid="mode">{{ modeLabel }}</span>
    </nav>
    <div class="row wrap" v-if="mode === 'custom'">
      <slot />
    </div>
  </template>
</template>
