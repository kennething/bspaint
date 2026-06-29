<template>
  <div class="flex flex-col items-center justify-center">
    <LeftMenu />
    <LeftHud />

    <Canvas />

    <RightMenu />
    <RightHud />
  </div>
</template>

<script setup lang="ts">
import { ActiveSelection, IText, Path } from "fabric";

const userStore = useUserStore();
const { isMac, disableKeybinds } = storeToRefs(userStore);

const canvasStore = useCanvasStore();
const { fabricCanvas: canvas, activeLayerId, activeLayer } = storeToRefs(canvasStore);

const toolStore = useToolStore();
const { zoomLevel } = storeToRefs(toolStore);

const config = useRuntimeConfig();

onMounted(() => document.addEventListener("keydown", handleKeyDown));
onUnmounted(() => document.removeEventListener("keydown", handleKeyDown));

async function handleKeyDown(event: KeyboardEvent) {
  if (disableKeybinds.value) return;

  if (!canvas.value) return console.warn("handleKeyDown no canvas");
  const eventKey = event.key.toLowerCase();

  function validateModiferKeys(modifierKeys: ModifierKey[]): boolean {
    return modifierKeys.every((key) => {
      if (key === "alt") if (!event.altKey) return false;
      if (key === "control") if (!event.ctrlKey) return false;
      if (key === "shift") if (!event.shiftKey) return false;
      if (key === "meta") if (!event.metaKey) return false;
      return true;
    });
  }

  const validKeybind = keybinds.find((k) => {
    const matchRegularKeys = k.keys[1] === eventKey && validateModiferKeys(k.keys[0]);
    if (!isMac.value || !("macKeys" in k)) return matchRegularKeys;

    const matchMacKeys = k.macKeys[1] === eventKey && validateModiferKeys(k.macKeys[0]);
    return matchMacKeys;
  });
  if (!validKeybind) return;

  if (validKeybind.action === "Undo") canvasStore.changeHistory("undo");
  else if (validKeybind.action === "Redo") canvasStore.changeHistory("redo");
  else if (validKeybind.action === "Brush") useSetTool("brush");
  else if (validKeybind.action === "Text") useSetTool("text");
  else if (validKeybind.action === "Eyedropper") useSetTool("eyedropper");
  else if (validKeybind.action === "Select") useSetTool("select");
  else if (validKeybind.action === "Delete Layer") canvasStore.deleteLayer(activeLayer.value);
  else if (validKeybind.action === "Toggle Layer Lock") canvasStore.toggleLock(activeLayer.value, !activeLayer.value.isLocked);
  else if (validKeybind.action === "Export Canvas") canvasStore.isExportingOpen = true;
  else if (validKeybind.action === "Resize Canvas") canvasStore.isResizingOpen = true;
  else if (validKeybind.action === "Help") canvasStore.isHelpOpen = true;
  else if (validKeybind.action === "Layer Up")
    activeLayerId.value = canvasStore.layers[canvasStore.layers.findIndex((l) => l.id === activeLayerId.value) + 1]?.id ?? canvasStore.layers[canvasStore.layers.length - 1]!.id;
  else if (validKeybind.action === "Layer Down") activeLayerId.value = canvasStore.layers[canvasStore.layers.findIndex((l) => l.id === activeLayerId.value) - 1]?.id ?? canvasStore.layers[0]!.id;
  else if (validKeybind.action === "Reset Zoom") useResetZoom();
  else if (validKeybind.action === "Zoom In") zoomLevel.value = Math.min(zoomLevel.value + 0.1, config.public.maxZoom);
  else if (validKeybind.action === "Zoom Out") zoomLevel.value = Math.max(zoomLevel.value - 0.1, config.public.minZoom);
  else if (validKeybind.action === "New Layer") canvasStore.triggerNewLayer = true;
  else if (validKeybind.action === "Select Layer 1") activeLayerId.value = canvasStore.layers[0]?.id ?? canvasStore.layers[canvasStore.layers.length - 1]!.id;
  else if (validKeybind.action === "Select Layer 2") activeLayerId.value = canvasStore.layers[1]?.id ?? canvasStore.layers[canvasStore.layers.length - 1]!.id;
  else if (validKeybind.action === "Select Layer 3") activeLayerId.value = canvasStore.layers[2]?.id ?? canvasStore.layers[canvasStore.layers.length - 1]!.id;
  else if (validKeybind.action === "Select Layer 4") activeLayerId.value = canvasStore.layers[3]?.id ?? canvasStore.layers[canvasStore.layers.length - 1]!.id;
  else if (validKeybind.action === "Select Layer 5") activeLayerId.value = canvasStore.layers[4]?.id ?? canvasStore.layers[canvasStore.layers.length - 1]!.id;
  else if (validKeybind.action === "Select Layer 6") activeLayerId.value = canvasStore.layers[5]?.id ?? canvasStore.layers[canvasStore.layers.length - 1]!.id;
  else if (validKeybind.action === "Select Layer 7") activeLayerId.value = canvasStore.layers[6]?.id ?? canvasStore.layers[canvasStore.layers.length - 1]!.id;
  else if (validKeybind.action === "Select Layer 8") activeLayerId.value = canvasStore.layers[7]?.id ?? canvasStore.layers[canvasStore.layers.length - 1]!.id;
  else if (validKeybind.action === "Select Layer 9") activeLayerId.value = canvasStore.layers[8]?.id ?? canvasStore.layers[canvasStore.layers.length - 1]!.id;
  else if (validKeybind.action === "Select Top Layer") activeLayerId.value = canvasStore.layers[canvasStore.layers.length - 1]!.id;
  else if (validKeybind.action === "Shape") {
    if (toolStore.activeTool !== "shape") return useSetTool("shape");
    if (toolStore.selectedShape === "rectangle") toolStore.selectedShape = "circle";
    else if (toolStore.selectedShape === "circle") toolStore.selectedShape = "triangle";
    else if (toolStore.selectedShape === "triangle") toolStore.selectedShape = "rectangle";
  } // shape
  else if (validKeybind.action === "Delete Selected") {
    canvas.value.getActiveObjects().forEach((obj) => canvas.value?.remove(obj));
    canvas.value.discardActiveObject();
  } // delete selected
  else if (validKeybind.action === "Layer Opacity Down") {
    activeLayer.value.opacity = Math.max(activeLayer.value.opacity - 10, 0);
    useBrushPreview();
    useTextPreview();
  } // layer opacity down
  else if (validKeybind.action === "Layer Opacity Up") {
    activeLayer.value.opacity = Math.min(activeLayer.value.opacity + 10, 100);
    useBrushPreview();
    useTextPreview();
  } // layer opacity up
  else if (validKeybind.action === "Swap Tools") {
    // * previous -> active swap is in the watcher in toolStore
    useSetTool(toolStore.previousTool);
    toolStore.activeTool = toolStore.previousTool;
  } // swap tools
  else if (validKeybind.action === "Select All") {
    useSetTool("select");
    const selectableObjects = canvas.value.getObjects().filter((obj) => obj.selectable);
    if (selectableObjects.length === 0) return;

    canvas.value.discardActiveObject();
    canvas.value.setActiveObject(new ActiveSelection(selectableObjects, { canvas: canvas.value }));
    canvas.value.requestRenderAll();
  } // select all
  else if (validKeybind.action === "Deselect All") {
    canvas.value.discardActiveObject();

    const shapePreview = canvas.value.getObjects().find((obj) => obj.name === "shapePreview");
    if (shapePreview) canvas.value.remove(shapePreview);
    if (toolStore.isCreatingShape) toolStore.isCreatingShape = false;

    canvas.value.requestRenderAll();
  } // deselect all
  else if (validKeybind.action === "Toggle Canvas Guide") {
    canvasStore.showBoundingRect = !canvasStore.showBoundingRect;
    useRedrawBoundingRect();
  } // togle canvas guide
  else if (validKeybind.action === "Tool Size Down") {
    const tool = toolStore.activeTool;
    if (tool === "brush") {
      toolStore.brushSize = Math.max(toolStore.brushSize - 1, config.public.minBrushSize); // useBrushPreview called in watcher in LeftMenu/Modifiers
      useUpdateBrush();
    } else if (tool === "text") toolStore.fontSize = Math.max(toolStore.fontSize - 1, config.public.minFontSize);
    else if (tool === "select") {
      if (toolStore.selectedObject instanceof Path) {
        toolStore.selectedObjectChangedEvent = true;
        toolStore.selectedObject.strokeWidth = Math.max(toolStore.selectedObject.strokeWidth - 1, config.public.minBrushSize);
        canvas.value.requestRenderAll();
      } else if (toolStore.selectedObject instanceof IText) {
        toolStore.selectedObjectChangedEvent = true;
        toolStore.selectedObject.fontSize = Math.max(toolStore.selectedObject.fontSize - 1, config.public.minFontSize);
        canvas.value.requestRenderAll();
      }
    }
  } // tool size down
  else if (validKeybind.action === "Tool Size Up") {
    const tool = toolStore.activeTool;
    if (tool === "brush") {
      toolStore.brushSize = Math.min(toolStore.brushSize + 1, config.public.maxBrushSize); // useBrushPreview called in watcher in LeftMenu/Modifiers
      useUpdateBrush();
    } else if (tool === "text") toolStore.fontSize = Math.min(toolStore.fontSize + 1, config.public.maxFontSize);
    else if (tool === "select") {
      if (toolStore.selectedObject instanceof Path) {
        toolStore.selectedObjectChangedEvent = true;
        toolStore.selectedObject.strokeWidth = Math.min(toolStore.selectedObject.strokeWidth + 1, config.public.maxBrushSize);
        canvas.value.requestRenderAll();
      } else if (toolStore.selectedObject instanceof IText) {
        toolStore.selectedObjectChangedEvent = true;
        toolStore.selectedObject.fontSize = Math.min(toolStore.selectedObject.fontSize + 1, config.public.maxFontSize);
        canvas.value.requestRenderAll();
      }
    }
  } // tool size up
  else if (validKeybind.action === "Copy" || validKeybind.action === "Cut") {
    const activeObject = canvas.value.getActiveObject();
    if (!activeObject) return;

    canvasStore.fabricClipboard = await activeObject.clone();
    if (validKeybind.action === "Cut") canvas.value.remove(activeObject);
  } // * copy/cut - paste is handled in paste event handler
  else return;

  event.preventDefault();
}
</script>

<style scoped></style>
