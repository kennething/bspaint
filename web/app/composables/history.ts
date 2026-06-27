import { type CanvasEvents } from "fabric";

export function useSaveHistory(event: CanvasEvents["object:added"], isAdding = false) {
  const canvasStore = useCanvasStore();

  if (event.target.excludeFromExport) return;
  if (isAdding && event.target.isType("Path")) return;
  canvasStore.saveHistory();
}
