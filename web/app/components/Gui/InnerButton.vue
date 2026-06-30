<template>
  <button
    @click="emit('clicked')"
    class="flex w-8 items-center justify-center p-1"
    :class="{
      'rounded-full': isMac,
      'du-tooltip': tooltipDirection,
      'du-tooltip-top': tooltipDirection === 'top',
      'du-tooltip-bottom': tooltipDirection === 'bottom',
      'du-tooltip-left': tooltipDirection === 'left',
      'du-tooltip-right': tooltipDirection === 'right',
      'opacity-30 hover:bg-transparent!': isDisabled,
      'bg-neutral-200/90 hover:bg-neutral-300/75': isMac && !isDisabled && isActive,
      'hover:bg-neutral-200/50': isMac && !isDisabled && !isActive,
      'bg-sky-200/65 hover:bg-sky-200': !isMac && !isDisabled && isActive,
      'hover:bg-sky-200/35': !isMac && !isDisabled && !isActive
    }"
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

const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);

const keybindKeys = computed(() => useGetKeybindString(props.label));
</script>

<style scoped></style>
