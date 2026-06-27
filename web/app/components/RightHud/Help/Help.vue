<template>
  <GuiButtonSingle image="/icons/help.svg" label="Help" tooltip-direction="left" @clicked="isHelpOpen = true" />

  <RightHudHelpModal v-if="isHelpOpen" @close="isHelpOpen = false" />
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { isHelpOpen } = storeToRefs(canvasStore);
</script>

<style scoped></style>
