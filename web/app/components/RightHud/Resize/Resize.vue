<template>
  <GuiButtonSingle image="/icons/resize.svg" label="Resize Canvas" tooltip-direction="top" @clicked="isResizingOpen = true" />

  <RightHudResizeModal v-if="isResizingOpen" @close="isResizingOpen = false" />
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { isResizingOpen } = storeToRefs(canvasStore);
</script>

<style scoped></style>
