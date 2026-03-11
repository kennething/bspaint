<template>
  <button
    class="du-tooltip du-tooltip-right rounded-lg border bg-neutral-50 p-1"
    :class="{ 'cursor-not-allowed! opacity-50': !canDoAction, 'hover:bg-white': canDoAction && !isDoingAction, 'bg-neutral-900/90': isDoingAction }"
    :disabled="!canDoAction"
    @click="emit('clicked')"
  >
    <!-- :data-tip="tooltip" -->
    <img class="size-8" :src="`/icons/${icon}.svg`" :alt="icon" :class="{ invert: isDoingAction }" />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  tooltip: string;
  icon: string;
  canDoAction: boolean;
  isDoingAction: boolean;
}>();
const emit = defineEmits<{ clicked: [void] }>();
</script>

<style scoped></style>
