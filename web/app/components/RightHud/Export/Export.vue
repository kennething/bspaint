<template>
  <GuiButtonSingle image="/icons/save.svg" label="Export Canvas" tooltip-direction="left" @clicked="isExportingOpen = true" />

  <RightHudExportModal v-if="isExportingOpen" @close="isExportingOpen = false" />
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { isExportingOpen } = storeToRefs(canvasStore);
</script>

<style scoped></style>
