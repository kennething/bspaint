import type { Reactive } from "vue";
import type { Tool } from "~/utils/tools";

export const useUserStore = defineStore("userStore", () => {
  const canvasScale = ref(1);
  const currentColor = reactive({
    primary: "#000000",
    secondary: "#ffffff"
  });
  const currentTool = ref<ToolType>("brush");

  const tools = reactive({
    brush: {
      type: "brush",
      radius: 5,
      isDrawing: false
    } as Brush,
    fill: {
      type: "fill"
    } as Fill,
    eraser: {
      type: "eraser",
      radius: 5,
      isDrawing: false
    } as Eraser,
    select: {
      type: "select",
      isTransparent: false,
      selectState: "idle",
      selectionRect: [0, 0, 0, 0],
      previousSelectionRect: [0, 0, 0, 0],
      rotationAngle: 0,
      selectionCanvas: null,
      startInteractionData: null
    } as Select,
    eyedropper: {
      type: "eyedropper"
    } as Eyedropper
  }) satisfies Reactive<Record<ToolType, Tool>>;

  const isDrawing = computed(() => {
    const tool = tools[currentTool.value];
    return "isDrawing" in tool && tool.isDrawing;
  });

  return { canvasScale, currentColor, currentTool, tools, isDrawing };
});
