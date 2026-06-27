<template>
  <div class="flex items-center justify-center gap-2 rounded-full">
    <GuiSlider
      class="z-11"
      name="Zoom"
      image="/icons/zoom.svg"
      is-skewed
      :custom-button-tooltip="`Zoom In/Out (${isMac ? modifierKeySet.meta : modifierKeySet.control} + -/=)`"
      button-tooltip-direction="right"
      :min="config.public.minZoom"
      :max="config.public.maxZoom"
      tooltip-position="top"
      v-model="tempZoom"
      :tooltip-format="(val) => `${val.toFixed(2)}x`"
    />
    <GuiButtonSingle image="/icons/zoom-out.svg" label="Reset Zoom" tooltip-direction="top" @clicked="useResetZoom" />
  </div>
</template>

<script setup lang="ts">
const toolStore = useToolStore();
const { zoomLevel } = storeToRefs(toolStore);

const userStore = useUserStore();
const { isMac, modifierKeySet } = storeToRefs(userStore);

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
