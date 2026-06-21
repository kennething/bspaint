import { PencilBrush } from "fabric";

/** updates brush settings to current primary color and size */
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
  const { fabricCanvas: canvas, layers } = storeToRefs(canvasStore);

  const toolStore = useToolStore();
  toolStore.activeTool = tool;
  if (!canvas.value) return;

  canvas.value.isDrawingMode = false;
  canvas.value.selection = false;
  canvas.value.forEachObject((obj) => {
    obj.selectable = false;
    obj.evented = false;
  });

  if (tool === "select") {
    canvas.value.selection = true;
    canvas.value.forEachObject((obj) => {
      const layer = layers.value.find((layer) => layer.id === obj.layerId);
      if (!layer || layer.isLocked) return;

      obj.selectable = true;
      obj.evented = true;
    });
  } // select
  else if (tool === "brush") {
    canvas.value.isDrawingMode = true;
    useUpdateBrush();
  } // brush
  else if (tool === "eraser") {
    canvas.value.isDrawingMode = true;
    canvas.value.freeDrawingBrush = new PencilBrush(canvas.value);
    canvas.value.freeDrawingBrush.color = "#ffffff";
    canvas.value.freeDrawingBrush.width = toolStore.brushSize;
  } // eraser
}
