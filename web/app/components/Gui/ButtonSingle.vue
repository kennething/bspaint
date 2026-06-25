<template>
  <GuiMenu class="flex items-center justify-center rounded-full! px-0.5">
    <GuiInnerButton :class="innerClassOverride" @clicked="emit('clicked')" :image="image" :label="label" :is-disabled="isDisabled" />
  </GuiMenu>
</template>

<script setup lang="ts">
const props = defineProps<{
  image: string;
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  /** applies classes to the <GuiInnerButton/> within this component */
  innerClassOverride?: string;
}>();
const emit = defineEmits<{
  clicked: [void];
}>();
</script>

<style scoped></style>
