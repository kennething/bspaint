<template>
  <canvas ref="canvas" class="transparent-sprite h-screen w-screen"></canvas>
</template>

<script setup lang="ts">
import { Canvas, InteractiveFabricObject, Point } from "fabric";
import { v7 } from "uuid";

const canvasRef = useTemplateRef("canvas");

const canvasStore = useCanvasStore();
const { activeLayerId, layers } = storeToRefs(canvasStore);
const toolStore = useToolStore();
const { backgroundColor } = storeToRefs(toolStore);

onMounted(() => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  canvasStore.fabricCanvas = new Canvas(canvasRef.value ?? undefined, {
    width: windowWidth,
    height: windowHeight,
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
  canvasStore.fabricCanvas.isDrawingMode = true;

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
  useSetupBrushPreview();
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

  useUpdateBrush();
});

onUnmounted(() => {
  document.removeEventListener("paste", useHandlePaste);
  if (canvasStore.fabricCanvas) canvasStore.fabricCanvas.dispose();
});
</script>

<style scoped>
.transparent-sprite {
  background: conic-gradient(#ddd 25%, #fff 0 50%, #ddd 0 75%, #fff 0) 0 0 / 4rem 4rem;
}
</style>
