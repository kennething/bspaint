export type Brush = {
  type: "brush";
  radius: number;
};

export type Fill = {
  type: "fill";
};

export type Eraser = {
  type: "eraser";
  radius: number;
};

export type Tool = Brush | Fill | Eraser;
export type ToolType = Tool["type"];
export const tools = ["brush", "fill", "eraser"] as const satisfies ToolType[];
