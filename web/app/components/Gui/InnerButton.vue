<template>
  <button
    @click="emit('clicked')"
    class="flex w-8 items-center justify-center rounded-full p-1"
    :class="[
      {
        'du-tooltip': tooltipDirection,
        'du-tooltip-top': tooltipDirection === 'top',
        'du-tooltip-bottom': tooltipDirection === 'bottom',
        'du-tooltip-left': tooltipDirection === 'left',
        'du-tooltip-right': tooltipDirection === 'right'
      },
      isDisabled ? 'opacity-30 hover:bg-transparent!' : isActive ? 'bg-neutral-200/90 hover:bg-neutral-300/75' : 'hover:bg-neutral-200/50'
    ]"
    :data-tip="tooltipDirection ? `${label}${keybindKeys ? ` (${keybindKeys})` : ''}` : undefined"
    :aria-label="label"
    :disabled="isDisabled"
  >
    <img class="size-5" :src="image" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  image: string;
  label: KeybindName | (string & {});
  tooltipDirection?: "top" | "bottom" | "left" | "right";
  isActive?: boolean;
  isDisabled?: boolean;
}>();
const emit = defineEmits<{
  clicked: [void];
}>();

const keybindKeys = computed(() => useGetKeybindString(props.label));
</script>

<style scoped></style>
