<template>
  <GuiButtonSingle image="/icons/resize.svg" label="Resize the canvas" @clicked="showResizeModal = true" />

  <RightHudResizeModal v-if="showResizeModal" />
</template>

<script setup lang="ts">
const showResizeModal = ref(false);
</script>

<style scoped></style>
