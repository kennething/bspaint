<template>
  <GuiMenu class="flex items-center justify-center rounded-full! px-0.5">
    <GuiInnerButton @clicked="emit('clicked')" :image="image" :label="label" />
  </GuiMenu>
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
