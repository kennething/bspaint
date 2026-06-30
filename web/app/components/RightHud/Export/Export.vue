<template>
  <GuiButtonSingle :class="{ 'border-x-0!': !isMac }" image="/icons/save.svg" label="Export Canvas" tooltip-direction="left" @clicked="isExportingOpen = true" />

  <RightHudExportModal v-if="isExportingOpen" @close="isExportingOpen = false" />
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { isExportingOpen } = storeToRefs(canvasStore);

const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);
</script>

<style scoped></style>
