<template>
  <GuiButtonSingle image="/icons/save.svg" label="Export the canvas" @clicked="showExportModal = true" />

  <RightHudExportModal v-if="showExportModal" @close="showExportModal = false" />
</template>

<script setup lang="ts">
const showExportModal = ref(false);
</script>

<style scoped></style>
