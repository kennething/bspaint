// * everything here is made lowercase
export type ModifierKey = "control" | "shift" | "alt" | "meta";
export const modifierKeys = {
  mac: {
    control: "^",
    shift: "⇧",
    alt: "⌥",
    meta: "⌘"
  },
  windows: {
    control: "Ctrl",
    shift: "Shift",
    alt: "Alt",
    meta: "Win"
  }
} as const satisfies Record<"mac" | "windows", Record<ModifierKey, string>>;

export const specialKeys = {
  backspace: "⌫",
  delete: "⌫",
  enter: "↵",
  tab: "⇥",
  escape: "⎋",
  " ": "␣",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→"
} as const satisfies Partial<Record<KeyboardEventKey, string>>;

// * (typeof KeyboardEvent.prototype.key) is just string
type KeyboardEventKey =
  | "escape"
  | "`"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "0"
  | "-"
  | "="
  | "backspace"
  | "delete"
  | "tab"
  | "q"
  | "w"
  | "e"
  | "r"
  | "t"
  | "y"
  | "u"
  | "i"
  | "o"
  | "p"
  | "P"
  | "["
  | "]"
  | "\\"
  | "a"
  | "s"
  | "d"
  | "f"
  | "g"
  | "h"
  | "j"
  | "k"
  | "l"
  | ";"
  | "\'"
  | "enter"
  | "z"
  | "x"
  | "c"
  | "v"
  | "b"
  | "n"
  | "m"
  | ","
  | "."
  | "/"
  | "arrowup"
  | " "
  | "arrowleft"
  | "arrowdown"
  | "arrowright";

export type Keybind = {
  /** any number of modifier keys + an actual key */
  keys: [ModifierKey[], KeyboardEventKey | (string & {})];
  /** separate set of keybinds for mac */
  macKeys?: Keybind["keys"];
  action: string;
  category: "tools" | "canvas" | "layers" | "other";
};

/** keybinds with more modifier keys should be placed above to avoid conflicts */
export const keybinds = [
  { keys: [["control", "shift", "alt"], "backspace"], macKeys: [["meta", "shift", "alt"], "backspace"], action: "Delete Layer", category: "layers" },
  { keys: [["control", "shift", "alt"], "delete"], macKeys: [["meta", "shift", "alt"], "delete"], action: "Delete Layer", category: "layers" },
  { keys: [["alt"], "1"], macKeys: [["control", "alt"], "1"], action: "Select Layer 1", category: "layers" }, // hardcoded tooltip
  { keys: [["alt"], "2"], macKeys: [["control", "alt"], "2"], action: "Select Layer 2", category: "layers" }, // hardcoded tooltip
  { keys: [["alt"], "3"], macKeys: [["control", "alt"], "3"], action: "Select Layer 3", category: "layers" }, // hardcoded tooltip
  { keys: [["alt"], "4"], macKeys: [["control", "alt"], "4"], action: "Select Layer 4", category: "layers" }, // hardcoded tooltip
  { keys: [["alt"], "5"], macKeys: [["control", "alt"], "5"], action: "Select Layer 5", category: "layers" }, // hardcoded tooltip
  { keys: [["alt"], "6"], macKeys: [["control", "alt"], "6"], action: "Select Layer 6", category: "layers" }, // hardcoded tooltip
  { keys: [["alt"], "7"], macKeys: [["control", "alt"], "7"], action: "Select Layer 7", category: "layers" }, // hardcoded tooltip
  { keys: [["alt"], "8"], macKeys: [["control", "alt"], "8"], action: "Select Layer 8", category: "layers" }, // hardcoded tooltip
  { keys: [["alt"], "9"], macKeys: [["control", "alt"], "9"], action: "Select Layer 9", category: "layers" }, // hardcoded tooltip
  { keys: [["alt"], "0"], macKeys: [["control", "alt"], "0"], action: "Select Top Layer", category: "layers" },
  { keys: [["alt"], "enter"], macKeys: [["control", "alt"], "enter"], action: "New Layer", category: "layers" }, // hardcoded tooltip
  { keys: [["alt"], "arrowup"], macKeys: [["control", "alt"], "arrowup"], action: "Layer Up", category: "layers" },
  { keys: [["alt"], "arrowdown"], macKeys: [["control", "alt"], "arrowdown"], action: "Layer Down", category: "layers" },
  { keys: [["control"], "y"], macKeys: [["meta", "shift"], "z"], action: "Redo", category: "other" },
  { keys: [[], ""], macKeys: [["meta"], "y"], action: "Redo", category: "other" },
  { keys: [["control"], "z"], macKeys: [["meta"], "z"], action: "Undo", category: "other" },
  { keys: [["control"], "/"], macKeys: [["meta"], "/"], action: "Help", category: "other" },
  { keys: [["control"], "s"], macKeys: [["meta"], "s"], action: "Export Canvas", category: "canvas" },
  { keys: [["control"], "d"], macKeys: [["meta"], "d"], action: "Resize Canvas", category: "canvas" },
  { keys: [["control"], "a"], macKeys: [["meta"], "a"], action: "Select All", category: "canvas" },
  { keys: [["control"], "l"], macKeys: [["meta"], "l"], action: "Toggle Layer Lock", category: "layers" },
  { keys: [["control"], "b"], macKeys: [["meta"], "b"], action: "Toggle Canvas Guide", category: "canvas" },
  { keys: [["control"], "arrowup"], macKeys: [["meta"], "arrowup"], action: "Layer Opacity Up", category: "layers" }, // hardcoded tooltip
  { keys: [["control"], "arrowdown"], macKeys: [["meta"], "arrowdown"], action: "Layer Opacity Down", category: "layers" }, // hardcoded tooltip
  { keys: [["control"], "0"], macKeys: [["meta"], "0"], action: "Reset Zoom", category: "canvas" },
  { keys: [["control"], "-"], macKeys: [["meta"], "-"], action: "Zoom Out", category: "canvas" }, // hardcoded tooltip
  { keys: [["control"], "="], macKeys: [["meta"], "="], action: "Zoom In", category: "canvas" }, // hardcoded tooltip
  { keys: [[], "arrowup"], action: "Tool Size Up", category: "tools" }, // hardcoded tooltip
  { keys: [[], "arrowdown"], action: "Tool Size Down", category: "tools" }, // hardcoded tooltip
  { keys: [[], "escape"], action: "Deselect All", category: "canvas" },
  { keys: [[], "backspace"], action: "Delete Selected", category: "canvas" },
  { keys: [[], "delete"], action: "Delete Selected", category: "canvas" },
  { keys: [[], "v"], action: "Select", category: "tools" },
  { keys: [[], "b"], action: "Brush", category: "tools" },
  { keys: [[], "t"], action: "Text", category: "tools" },
  { keys: [[], "e"], action: "Eyedropper", category: "tools" },
  { keys: [[], " "], action: "Swap Tools", category: "tools" }
] as const satisfies Keybind[];
export type KeybindName = (typeof keybinds)[number]["action"];
