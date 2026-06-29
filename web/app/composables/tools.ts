import { PencilBrush } from "fabric";

/** updates brush settings to current primary/secondary color and size
 *
 * also redraws brush preview */
export function useUpdateBrush() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas } = storeToRefs(canvasStore);

  const toolStore = useToolStore();
  const { activeTool, brushSize, primaryColor } = storeToRefs(toolStore);

  if (!canvas.value || activeTool.value !== "brush") return;

  canvas.value.freeDrawingBrush = new PencilBrush(canvas.value);
  canvas.value.freeDrawingBrush.color = primaryColor.value.slice(0, 7);
  canvas.value.freeDrawingBrush.width = brushSize.value;
  useBrushPreview();
}

/** sets the active tool in `toolStore` */
export function useSetTool(tool: Tool) {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, activeLayer, layers, activeLayerId } = storeToRefs(canvasStore);
  if (!canvas.value) return;

  const toolStore = useToolStore();
  if (toolStore.activeTool !== "text") canvas.value.discardActiveObject();
  toolStore.activeTool = tool;

  canvas.value.isDrawingMode = false;
  canvas.value.selection = false;
  canvas.value.forEachObject((obj) => {
    obj.selectable = false;
    obj.evented = false;
    if (obj.name && ["brushPreview", "textPreview", "shapePreview"].includes(obj.name)) canvas.value?.remove(obj);
  });
  canvas.value.requestRenderAll();

  if (activeLayer.value.isLocked) return canvas.value.setCursor("not-allowed");

  if (tool === "select") {
    canvas.value.selection = true;
    canvas.value.forEachObject((obj) => {
      const layer = layers.value.find((layer) => layer.id === obj.layerId);
      if (!layer || layer.isLocked || layer.id !== activeLayerId.value) return;

      obj.selectable = true;
      obj.evented = true;
    });
  } // select
  else if (tool === "brush") {
    canvas.value.isDrawingMode = true;
    useUpdateBrush();
  } // brush
  else if (tool === "text") {
    useTextPreview();
  } // text
  else if (tool === "shape") {
    canvas.value.setCursor("crosshair");
  } // shape
}
