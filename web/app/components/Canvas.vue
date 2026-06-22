<template>
  <!-- <div class="flex flex-col items-center justify-center gap-4 p-4">
    <div class="flex items-center gap-2">
      <button @click="useSetTool('select')" :class="{ 'bg-gray-300': activeTool === 'select' }">Select</button>
      <button @click="useSetTool('brush')" :class="{ 'bg-gray-300': activeTool === 'brush' }">Brush</button>
      <button @click="useSetTool('text')" :class="{ 'bg-gray-300': activeTool === 'text' }">Text</button>
      <button @click="useSetTool('eyedropper')" :class="{ 'bg-gray-300': activeTool === 'eyedropper' }">Eyedropper</button>
      <input type="color" v-model="primaryColor" title="Primary Color" />
      <input type="color" v-model="secondaryColor" title="Secondary Color" />
    </div>
  </div> -->

  <canvas ref="canvas" class="transparent-sprite"></canvas>
</template>

<script setup lang="ts">
import { Canvas, InteractiveFabricObject, Point } from "fabric";
import { v7 } from "uuid";

const canvasRef = useTemplateRef("canvas");

const canvasStore = useCanvasStore();
const { activeLayerId, layers } = storeToRefs(canvasStore);
const toolStore = useToolStore();
const { zoomLevel, activeTool, primaryColor, secondaryColor, brushSize } = storeToRefs(toolStore);

onMounted(() => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  canvasStore.fabricCanvas = new Canvas(canvasRef.value ?? undefined, {
    width: windowWidth,
    height: windowHeight,
    backgroundColor: "#ffffffff",
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
  canvasStore.fabricCanvas.zoomToPoint(new Point(windowWidth / 2, windowHeight / 2), 0.5);

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

  setupScroll(canvasStore.fabricCanvas, (zoom) => void (zoomLevel.value = zoom));
  setupMouseDown(
    canvasStore.fabricCanvas,
    () => activeTool.value,
    () => ({ fontSize: toolStore.fontSize, fontFamily: toolStore.fontFamily }),
    () => ({ primary: primaryColor.value, secondary: toolStore.secondaryColor }),
    () => activeLayerId.value,
    () => layers.value.find((layer) => layer.id === activeLayerId.value),
    toolStore.setColor,
    useSetTool
  );
  setupBrushPreview(
    canvasStore.fabricCanvas,
    () => activeTool.value,
    () => (layers.value.find((layer) => layer.id === activeLayerId.value)?.opacity ?? 100) / 100,
    () => brushSize.value,
    () => primaryColor.value
  );
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
  window.addEventListener("paste", handlePasteHelper);

  useUpdateBrush();
});

onUnmounted(() => {
  window.removeEventListener("paste", handlePasteHelper);
  if (canvasStore.fabricCanvas) canvasStore.fabricCanvas.dispose();
});

function handlePasteHelper(event: ClipboardEvent) {
  return handlePaste(canvasStore.fabricCanvas!, event, () => activeLayerId.value, useSetTool);
}
</script>

<style scoped>
.transparent-sprite {
  background: conic-gradient(#ddd 25%, #fff 0 50%, #ddd 0 75%, #fff 0) 0 0 / 4rem 4rem;
}
</style>
