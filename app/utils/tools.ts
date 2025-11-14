export interface Tool {
  type: string;
  shortcut: string;
}

export interface Brush extends Tool {
  type: "brush";
  shortcut: "b";
  radius: number;
  isDrawing: boolean;
}
export interface Fill extends Tool {
  type: "fill";
  shortcut: "f";
}
export interface Eraser extends Tool {
  type: "eraser";
  shortcut: "e";
  radius: number;
  isDrawing: boolean;
}
type SelectionRect = [x: number, y: number, width: number, height: number];
export interface Select extends Tool {
  type: "select";
  shortcut: "v";
  isTransparent: boolean;
  selectState: "idle" | "selecting" | "selected" | "moving" | "rotating" | "resizing";
  selectionRect: SelectionRect;
  previousSelectionRect: SelectionRect;
  /** Holds rotation angle in radians */
  rotationAngle: number;
  selectionCanvas: HTMLCanvasElement | null;
  startInteractionData: {
    startMouseX: number;
    startMouseY: number;
    startRect: SelectionRect;
    startAngle: number;
    startDistance: number;
    startMouseAngle: number;
  } | null;
}
export interface Eyedropper extends Tool {
  type: "eyedropper";
  shortcut: "i";
}

const tools = ["brush", "fill", "eraser", "select", "eyedropper"] as const;
export type ToolType = (typeof tools)[number];
