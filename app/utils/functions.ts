export function getCursorStyle(tool: ToolType) {
  if (tool === "brush") return "cell";
  if (tool === "eraser") return "grab";
  if (tool === "fill") return "copy";
  if (tool === "select") return "crosshair";
  if (tool === "eyedropper") return "context-menu";
  return "default";
}
