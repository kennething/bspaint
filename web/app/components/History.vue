<template>
  <div class="flex flex-col items-center justify-center">
    <button @click="canvasStore.changeHistory('undo')" :disabled="!canUndo">undo</button>
    <button @click="canvasStore.changeHistory('redo')" :disabled="!canRedo">redo</button>
  </div>
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { canUndo, canRedo } = storeToRefs(canvasStore);
</script>

<style scoped></style>
