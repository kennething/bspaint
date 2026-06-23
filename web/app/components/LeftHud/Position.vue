<template>
  <GuiMenu class="flex items-center justify-center gap-2 rounded-full! px-2 py-1 select-none">
    <img class="size-5" src="/icons/coordinate.svg" aria-hidden="true" />
    <span class="text-sm font-light">{{ mousePos.x.toFixed(0) }}, {{ mousePos.y.toFixed(0) }}</span>
  </GuiMenu>
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { mousePos } = storeToRefs(canvasStore);
</script>

<style scoped></style>
