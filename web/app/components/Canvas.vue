<template>
  <div class="transparent-sprite relative flex h-screen w-screen items-center justify-center">
    <canvas ref="canvas" class="h-full w-full"></canvas>
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

<style scoped></style>
