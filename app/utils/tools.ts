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
type SelectionRect = [x: number, y: number, width: number, height: number];
export interface Select extends Tool {
  type: "select";
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

const tools = ["brush", "fill", "eraser", "select"] as const;
export type ToolType = (typeof tools)[number];
