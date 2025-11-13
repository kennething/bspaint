export interface Tool {
  type: string;
}

export interface Brush extends Tool {
  type: "brush";
  radius: number;
  isDrawing: boolean;
}
export interface Fill extends Tool {
  type: "fill";
}
export interface Eraser extends Tool {
  type: "eraser";
  radius: number;
  isDrawing: boolean;
}
export interface Select extends Tool {
  type: "select";
  isTransparent: boolean;
  selectState: "idle" | "selecting" | "selected" | "moving";
  selectionRect: [x: number, y: number, width: number, height: number];
  previousSelectionRect: [x: number, y: number, width: number, height: number];
  selectedImageData: ImageData | null;
  moveOffset: [x: number, y: number];
}

const tools = ["brush", "fill", "eraser", "select"] as const;
export type ToolType = (typeof tools)[number];
