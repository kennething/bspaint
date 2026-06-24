<template>
  <GuiButtonGroup>
    <GuiInnerButton image="/icons/undo.svg" label="Undo the last action" :is-disabled="!canUndo" @clicked="canvasStore.changeHistory('undo')" />
    <GuiInnerButton image="/icons/redo.svg" label="Redo the last action" :is-disabled="!canRedo" @clicked="canvasStore.changeHistory('redo')" />
  </GuiButtonGroup>
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { canUndo, canRedo } = storeToRefs(canvasStore);
</script>

<style scoped></style>
