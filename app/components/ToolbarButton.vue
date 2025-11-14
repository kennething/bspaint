<template>
  <button
    class="du-tooltip rounded-lg border p-1"
    :class="{ 'cursor-not-allowed! opacity-50': !canDoAction, 'hover:bg-neutral-200/50': canDoAction && !isDoingAction, 'bg-neutral-900/90': isDoingAction }"
    :disabled="!canDoAction"
    @click="emit('clicked')"
  >
    <img class="size-6" :src="`/icons/${icon}.svg`" :alt="icon" :class="{ invert: isDoingAction }" />
    <span class="du-tooltip-content du-tooltip-top">{{ tooltip }}</span>
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
