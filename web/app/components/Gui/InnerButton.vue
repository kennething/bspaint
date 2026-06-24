<template>
  <button
    @click="emit('clicked')"
    class="flex w-8 items-center justify-center rounded-full p-1"
    :class="[isActive ? 'bg-neutral-200/90 hover:bg-neutral-300/75' : 'hover:bg-neutral-200/50', { 'opacity-30 hover:bg-transparent!': isDisabled }]"
    :aria-label="label"
    :disabled="isDisabled"
  >
    <img class="size-5" :src="image" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  image: string;
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
}>();
const emit = defineEmits<{
  clicked: [void];
}>();
</script>

<style scoped></style>
