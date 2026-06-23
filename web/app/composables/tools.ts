import { PencilBrush } from "fabric";

/** updates brush settings to current primary/secondary color and size */
export function useUpdateBrush() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas } = storeToRefs(canvasStore);

  const toolStore = useToolStore();
  const { activeTool, brushSize, primaryColor } = storeToRefs(toolStore);

  if (!canvas.value || activeTool.value !== "brush") return;

  canvas.value.freeDrawingBrush = new PencilBrush(canvas.value);
  canvas.value.freeDrawingBrush.color = primaryColor.value;
  canvas.value.freeDrawingBrush.width = brushSize.value;
}

/** sets the active tool in `toolStore` */
export function useSetTool(tool: Tool) {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, layers, activeLayerId } = storeToRefs(canvasStore);

  const toolStore = useToolStore();
  toolStore.activeTool = tool;
  if (!canvas.value) return;

  canvas.value.isDrawingMode = false;
  canvas.value.selection = false;
  canvas.value.forEachObject((obj) => {
    obj.selectable = false;
    obj.evented = false;
    if (obj.name === "brushPreview") canvas.value?.remove(obj);
  });

  const activeLayer = layers.value.find((layer) => layer.id === activeLayerId.value);
  if (activeLayer?.isLocked) return canvas.value.setCursor("not-allowed");

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
}
