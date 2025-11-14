import type { Reactive } from "vue";
import type { Tool } from "~/utils/tools";

export const useUserStore = defineStore("userStore", () => {
  const canvasScale = ref(1);
  const canvasSize = ref<[width: number, height: number]>([1920, 1080]);

  const currentColor = reactive({
    primary: "#000000",
    secondary: "#ffffff"
  });
  const currentTool = ref<ToolType>("brush");

  const history = ref<string[]>([]);
  const historyIndex = ref(-1);

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
    } as Eraser
  }) satisfies Reactive<Record<ToolType, Tool>>;

  const isDrawing = computed(() => {
    const tool = tools[currentTool.value];
    return "isDrawing" in tool && tool.isDrawing;
  });

  const isTransparentUI = computed(() => tools.brush.isDrawing || tools.eraser.isDrawing || ["selecting", "moving", "rotating", "resizing"].includes(tools.select.selectState));

  const undoEvent = ref(false);
  const redoEvent = ref(false);
  const resetEvent = ref(false);

  return { canvasScale, canvasSize, currentColor, currentTool, tools, isDrawing, history, historyIndex, undoEvent, redoEvent, resetEvent, isTransparentUI };
});
