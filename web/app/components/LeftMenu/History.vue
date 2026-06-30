<template>
  <GuiButtonGroup :class="{ 'border-b-0! border-l-0!': !isMac }">
    <GuiInnerButton image="/icons/undo.svg" label="Undo" tooltip-direction="bottom" :is-disabled="!canUndo" @clicked="canvasStore.changeHistory('undo')" />
    <GuiInnerButton image="/icons/redo.svg" label="Redo" tooltip-direction="bottom" :is-disabled="!canRedo" @clicked="canvasStore.changeHistory('redo')" />
  </GuiButtonGroup>
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { canUndo, canRedo } = storeToRefs(canvasStore);

const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);
</script>

<style scoped></style>
