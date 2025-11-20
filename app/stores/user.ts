import type { Reactive } from "vue";

export const useUserStore = defineStore("userStore", () => {
  const canvasSize = ref<[width: number, height: number]>([500, 500]);

  const currentColor = reactive({
    primary: "#000000",
    secondary: "#ffffff"
  });
  const currentTool = ref<ToolType>("brush");
  const previousTool = ref<ToolType>("brush");

  const history = ref<[layerIndex: number, dataUrl: string][]>([]);
  const historyIndex = ref(-1);

  /** Image data from `.toDataURL()` */
  const layers = ref<Layer[]>([
    {
      dataUrl: "",
      isVisible: true,
      isLocked: false,
      opacity: 100
    }
  ]);
  const layerIndex = ref(0);

  const tools = reactive({
    select: {
      type: "select",
      shortcut: "v",
      isTransparent: true,
      selectState: "idle",
      selectionRect: [0, 0, 0, 0],
      previousSelectionRect: [0, 0, 0, 0],
      rotationAngle: 0,
      selectionCanvas: null,
      startInteractionData: null
    } as Select,
    brush: {
      type: "brush",
      shortcut: "b",
      radius: 5,
      isDrawing: false
    } as Brush,
    fill: {
      type: "fill",
      shortcut: "f"
    } as Fill,
    eyedropper: {
      type: "eyedropper",
      shortcut: "i"
    } as Eyedropper,
    eraser: {
      type: "eraser",
      shortcut: "e",
      radius: 50,
      isDrawing: false
    } as Eraser,
    text: {
      type: "text",
      shortcut: "t",
      isTyping: false,
      isLeftClick: true,
      currentText: "",
      textInputPosition: [0, 0],
      fontSize: 16,
      fontFamily: "Comic Sans MS"
    } as TextTool
  }) satisfies Reactive<Record<ToolType, Tool>>;

  const isDrawing = computed(() => {
    const tool = tools[currentTool.value];
    return "isDrawing" in tool && tool.isDrawing;
  });
  const isTransparentUI = computed(() => tools.brush.isDrawing || tools.eraser.isDrawing || ["selecting", "moving", "rotating", "resizing"].includes(tools.select.selectState));
  const isInModiferBar = ref(false);

  const undoEvent = ref(false);
  const redoEvent = ref(false);
  const resetEvent = ref(false);

  return {
    canvasSize,
    currentColor,
    currentTool,
    previousTool,
    tools,
    isDrawing,
    history,
    historyIndex,
    layers,
    layerIndex,
    undoEvent,
    redoEvent,
    resetEvent,
    isTransparentUI,
    isInModiferBar
  };
});
