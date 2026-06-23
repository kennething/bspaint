<template>
  <div class="relative flex h-screen w-screen items-center justify-center">
    <p class="absolute top-0 left-1/2 -translate-x-1/2 text-center text-2xl font-bold text-red-500">
      unfortunately, if the canvas is smaller than ur screen, upscaling the canvas wont work as expected. so ur gonna have to work with this :(
    </p>
    <canvas ref="canvas" class="transparent-sprite h-full w-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Canvas, InteractiveFabricObject } from "fabric";
import { v7 } from "uuid";

const canvasRef = useTemplateRef("canvas");

const canvasStore = useCanvasStore();
const { activeLayerId, layers, canvasSize } = storeToRefs(canvasStore);
const toolStore = useToolStore();
const { backgroundColor } = storeToRefs(toolStore);

onMounted(() => {
  canvasSize.value.width = window.innerWidth;
  canvasSize.value.height = window.innerHeight;

  canvasStore.fabricCanvas = new Canvas(canvasRef.value ?? undefined, {
    width: canvasSize.value.width,
    height: canvasSize.value.height,
    backgroundColor: backgroundColor.value,
    preserveObjectStacking: true,
    allowTouchScrolling: true,
    centeredKey: "altKey",
    centeredRotation: true,
    centeredScaling: true,
    uniScaleKey: "ctrlKey",
    selectionDashArray: [2, 2],
    selectionBorderColor: "blue",
    selectionKey: "shiftKey",
    controlsAboveOverlay: true,
    enableRetinaScaling: false
  });

  useRedrawBoundingRect();

  InteractiveFabricObject.ownDefaults = {
    ...InteractiveFabricObject.ownDefaults,
    cornerStyle: "circle",
    cornerStrokeColor: "blue",
    cornerColor: "lightblue",
    padding: 2,
    cornerDashArray: [1, 1],
    borderColor: "blue",
    borderDashArray: [2, 2],
    borderScaleFactor: 2,
    transparentCorners: false
  };

  canvasStore.saveHistory();

  useSetupScroll();
  useSetupMouseDown();
  useSetupMouseMove();

  canvasStore.fabricCanvas.on("object:added", (event) => {
    event.target.set({ uuid: v7() });
    useSaveHistory(event);
  });
  canvasStore.fabricCanvas.on("object:modified", useSaveHistory);
  canvasStore.fabricCanvas.on("object:removed", useSaveHistory);
  canvasStore.fabricCanvas.on("path:created", (event) => {
    event.path.set({ layerId: activeLayerId.value });
    event.path.opacity = (layers.value.find((layer) => layer.id === activeLayerId.value)?.opacity ?? 100) / 100;
    canvasStore.saveHistory();
  });

  document.addEventListener("paste", useHandlePaste);
  window.addEventListener("resize", useHandleResize);

  useUpdateBrush();
  canvasStore.fabricCanvas.isDrawingMode = true;
});

onUnmounted(() => {
  document.removeEventListener("paste", useHandlePaste);
  window.removeEventListener("resize", useHandleResize);
  if (canvasStore.fabricCanvas) canvasStore.fabricCanvas.dispose();
});
</script>

<style scoped>
.transparent-sprite {
  background: conic-gradient(#ddd 25%, #fff 0 50%, #ddd 0 75%, #fff 0) 0 0 / 4rem 4rem;
}
</style>
