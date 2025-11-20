export interface Layer {
  /** Image data from `.toDataURL()` */
  dataUrl: string;
  isVisible: boolean;
  isLocked: boolean;
  /** `0`-`100` */
  opacity: number;
}

export interface Shortcut {
  tool: ToolType;
  keys: string[];
  shortcuts?: GeneralShortcut[];
}

export interface GeneralShortcut {
  name: string;
  note?: string;
  keys: string[];
}
