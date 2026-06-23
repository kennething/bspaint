import { type CanvasEvents } from "fabric";

export function useSaveHistory(event: CanvasEvents["object:added"]) {
  const canvasStore = useCanvasStore();

  if (event.target.excludeFromExport) return;
  if (event.target.isType("Path")) return;
  canvasStore.saveHistory();
}
