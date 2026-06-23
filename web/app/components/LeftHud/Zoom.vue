<template>
  <div class="flex items-center justify-center gap-2 rounded-full">
    <GuiSlider name="Zoom level" image="/icons/zoom.svg" :min="config.public.minZoom" :max="config.public.maxZoom" :step="0.1" tooltip-position="top" v-model="tempZoom" />
    <GuiMenu class="flex items-center justify-center rounded-full! px-0.5">
      <button @click="useResetZoom" class="flex w-8 items-center justify-center rounded-full p-1 hover:bg-neutral-200/50" aria-label="Reset zoom">
        <img class="size-5" src="/icons/zoom-out.svg" aria-hidden="true" />
      </button>
    </GuiMenu>
  </div>
</template>

<script setup lang="ts">
const toolStore = useToolStore();
const { zoomLevel } = storeToRefs(toolStore);

const config = useRuntimeConfig();
const tempZoom = ref(zoomLevel.value);
watch(tempZoom, (newZoom) => {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("handleZoom no fabricCanvas");

  const toolStore = useToolStore();
  const { zoomLevel } = storeToRefs(toolStore);
  const config = useRuntimeConfig();

  if (newZoom > config.public.maxZoom) newZoom = config.public.maxZoom;
  if (newZoom < config.public.minZoom) newZoom = config.public.minZoom;

  zoomLevel.value = newZoom;
  canvas.value.zoomToPoint(canvas.value.getCenterPoint(), newZoom);
});
watch(zoomLevel, (newZoom) => {
  if (newZoom !== tempZoom.value) tempZoom.value = newZoom;
});
</script>

<style scoped></style>
