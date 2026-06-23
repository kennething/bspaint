<template>
  <GuiMenu class="flex items-center justify-center gap-2 rounded-full! px-0.5 select-none" :class="{ 'border-red-200/70! bg-red-100/90!': !isInBounds }">
    <button
      @click="toggleBoundingRect"
      class="flex w-full items-center justify-center gap-2 rounded-full p-1"
      :class="isInBounds ? 'hover:bg-neutral-200/50' : 'hover:bg-red-200/50'"
      aria-label="Toggle bounding box"
    >
      <img class="size-5" src="/icons/coordinate.svg" aria-hidden="true" />
      <span class="text-sm font-light">{{ mousePos.x.toFixed(0) }}, {{ mousePos.y.toFixed(0) }}</span>
    </button>
  </GuiMenu>
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { mousePos, showBoundingRect } = storeToRefs(canvasStore);

const isInBounds = computed(() => {
  if (!showBoundingRect.value) return true;
  const { x, y } = mousePos.value;
  const { width, height } = canvasStore.canvasSize;
  return x >= 0 && x <= width && y >= 0 && y <= height;
});

function toggleBoundingRect() {
  showBoundingRect.value = !showBoundingRect.value;
  useHandleResize();
}
</script>

<style scoped></style>
