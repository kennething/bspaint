<template>
  <GuiMenu class="flex items-center justify-center px-0.5" :class="{ 'rounded-full!': isMac }">
    <GuiInnerButton :class="innerClassOverride" @clicked="emit('clicked')" :image="image" :label="label" :tooltip-direction="tooltipDirection" :is-disabled="isDisabled" />
  </GuiMenu>
</template>

<script setup lang="ts">
const props = defineProps<{
  image: string;
  label: KeybindName | (string & {});
  tooltipDirection?: "top" | "bottom" | "left" | "right";
  isActive?: boolean;
  isDisabled?: boolean;
  /** applies classes to the <GuiInnerButton/> within this component */
  innerClassOverride?: string;
}>();
const emit = defineEmits<{
  clicked: [void];
}>();

const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);
</script>

<style scoped></style>
