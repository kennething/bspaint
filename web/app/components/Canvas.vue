<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <div class="flex items-center gap-2">
      <button @click="useSetTool('select')" :class="{ 'bg-gray-300': activeTool === 'select' }">Select</button>
      <button @click="useSetTool('brush')" :class="{ 'bg-gray-300': activeTool === 'brush' }">Brush</button>
      <button @click="useSetTool('eraser')" :class="{ 'bg-gray-300': activeTool === 'eraser' }">Eraser</button>
      <button @click="useSetTool('text')" :class="{ 'bg-gray-300': activeTool === 'text' }">Text</button>
      <button @click="useSetTool('eyedropper')" :class="{ 'bg-gray-300': activeTool === 'eyedropper' }">Eyedropper</button>
      <input type="color" v-model="primaryColor" title="Primary Color" />
      <input type="color" v-model="secondaryColor" title="Secondary Color" />
    </div>
  </div>

  <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { Canvas, InteractiveFabricObject } from "fabric";

const canvasRef = useTemplateRef("canvas");

const canvasStore = useCanvasStore();
const { activeLayerId } = storeToRefs(canvasStore);
const toolStore = useToolStore();
const { zoomLevel, activeTool, primaryColor, secondaryColor } = storeToRefs(toolStore);

onMounted(() => {
  canvasStore.fabricCanvas = new Canvas(canvasRef.value ?? undefined, {
    width: 800,
    height: 600,
    backgroundColor: "#ffffff",
    selection: true,
    preserveObjectStacking: true,
    enableRetinaScaling: false,
    allowTouchScrolling: true,
    centeredKey: "altKey",
    centeredRotation: true,
    centeredScaling: true,
    uniScaleKey: "ctrlKey",
    selectionDashArray: [2, 2],
    selectionBorderColor: "blue",
    selectionKey: "shiftKey",
    controlsAboveOverlay: true
  });

  InteractiveFabricObject.ownDefaults = {
    ...InteractiveFabricObject.ownDefaults,
    cornerStyle: "circle",
    cornerStrokeColor: "blue",
    cornerColor: "lightblue",
    padding: 2,
    cornerDashArray: [1, 1],
    borderColor: "blue",
    borderDashArray: [2, 2],
    borderScaleFactor: 2
  };

  setupZoom(canvasStore.fabricCanvas, (zoom) => void (zoomLevel.value = zoom));
  setupMouseDown(
    canvasStore.fabricCanvas,
    () => activeTool.value,
    () => ({ fontSize: toolStore.fontSize, fontFamily: toolStore.fontFamily }),
    () => ({ primary: primaryColor.value, secondary: toolStore.secondaryColor }),
    () => activeLayerId.value,
    toolStore.setColor,
    useSetTool
  );
  canvasStore.fabricCanvas.on("path:created", (event) => event.path.set({ layerId: activeLayerId.value }));
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

<style scoped></style>
