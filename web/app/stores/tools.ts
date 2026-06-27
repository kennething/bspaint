import { FabricObject } from "fabric";

export type Tool = "brush" | "fill" | "eyedropper" | "text" | "select"; // TODO: fill, rectangle? circle? -shapes

export const useToolStore = defineStore("toolStore", () => {
  const activeTool = ref<Tool>("brush");
  watch(activeTool, (_, oldTool) => (previousTool.value = oldTool));
  const previousTool = ref<Tool>("select");
  const zoomLevel = ref(1);

  const selectedObject = ref<FabricObject>();
  const stopWatchers = ref<Function[]>([]);
  const selectedObjectChangedEvent = ref(false);
  watch(selectedObjectChangedEvent, async (val) => {
    if (val) {
      await nextTick();
      selectedObjectChangedEvent.value = false;
    }
  });

  const backgroundColor = ref("#FFFFFFFF");
  const primaryColor = ref("#000000");
  const secondaryColor = ref("#FFFFFF");
  const recentColors = ref<string[]>(new Array(10).fill(""));

  const brushSize = ref(5);

  const fontSize = ref(24);
  const fontFamily = ref<FontFamily>("Comic Sans MS");

  watch(backgroundColor, (newColor) => {
    const canvasStore = useCanvasStore();
    if (!canvasStore.fabricCanvas) return console.warn("watch backgroundColor no fabricCanvas");
    canvasStore.fabricCanvas.backgroundColor = newColor;
    canvasStore.fabricCanvas.renderAll();
  });
  watch(primaryColor, (newColor) => setColor("primary", newColor));
  watch(secondaryColor, (newColor) => setColor("secondary", newColor));

  /** sets the color and also updates the recent colors list */
  function setColor(type: "primary" | "secondary" | "other", color: string) {
    if (type === "primary") primaryColor.value = color;
    else if (type === "secondary") secondaryColor.value = color;

    if (!recentColors.value.includes(color)) {
      recentColors.value.unshift(color);
      if (recentColors.value.length > 10) recentColors.value.pop();
    }

    useUpdateBrush();
  }

  return {
    activeTool,
    previousTool,
    backgroundColor,
    primaryColor,
    secondaryColor,
    recentColors,
    brushSize,
    fontSize,
    fontFamily,
    zoomLevel,
    setColor,
    selectedObject,
    stopWatchers,
    selectedObjectChangedEvent
  };
});
