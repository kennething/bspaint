import { type Canvas } from "fabric";

export type Layer = {
  id: number;
  name: string;
  isLocked: boolean;
  opacity: number;
  dataUrl: string;
};

export type HistoryEntry = {
  /** canvas representation in json string */
  objects: string;
  /** layers in json string */
  layers: string;
  layerIdCounter: number;
  activeLayerId: number;
};

export const useCanvasStore = defineStore("canvasStore", () => {
  const fabricCanvas = markRaw(shallowRef<Canvas>());
  const mousePos = reactive({ x: 0, y: 0 });
  const canvasSize = reactive({ width: 0, height: 0 });
  const showBoundingRect = ref(true);

  const layerIdCounter = ref(2);
  const activeLayerId = ref(1);

  const history = ref<HistoryEntry[]>([]);
  const historyIndex = ref(-1);
  const isHistoryProcessing = ref(false);
  const canUndo = computed(() => !isHistoryProcessing.value && historyIndex.value > 0);
  const canRedo = computed(() => !isHistoryProcessing.value && historyIndex.value < history.value.length - 1);

  async function saveHistory() {
    if (isHistoryProcessing.value || !fabricCanvas.value) return;

    const canvasClone = await fabricCanvas.value.clone(["layerId", "uuid"]);
    canvasClone.backgroundColor = "transparent";
    canvasClone.forEachObject((obj) => {
      if (!obj.excludeFromExport && obj.layerId !== activeLayerId.value) canvasClone.remove(obj);
      obj.opacity = 1;
    });
    layers.value.find((layer) => layer.id === activeLayerId.value)!.dataUrl = canvasClone.toDataURL({ format: "webp", multiplier: 1 });
    canvasClone.dispose();

    const jsonObjects = JSON.stringify(fabricCanvas.value.toDatalessJSON(["layerId", "uuid"]));
    const jsonLayers = JSON.stringify(layers.value);
    if (historyIndex.value < history.value.length - 1) history.value.splice(historyIndex.value + 1);

    history.value.push({
      objects: jsonObjects,
      layers: jsonLayers,
      layerIdCounter: layerIdCounter.value,
      activeLayerId: activeLayerId.value
    });
    historyIndex.value = history.value.length - 1;
  }
  async function changeHistory(type: "undo" | "redo") {
    if ((type === "undo" && !canUndo.value) || (type === "redo" && !canRedo.value)) return;
    if (!fabricCanvas.value) return console.warn("changeHistory no fabricCanvas");
    isHistoryProcessing.value = true;

    historyIndex.value += type === "undo" ? -1 : 1;
    const historyEntry = history.value[historyIndex.value];
    if (!historyEntry) return console.warn("changeHistory no history entry for index", historyIndex.value);

    await fabricCanvas.value.loadFromJSON(historyEntry.objects);
    activeLayerId.value = historyEntry.activeLayerId;
    layers.value = JSON.parse(historyEntry.layers);
    layerIdCounter.value = historyEntry.layerIdCounter;
    useRedrawBoundingRect();
    fabricCanvas.value.renderAll();

    isHistoryProcessing.value = false;
  }

  const layers = ref<Layer[]>([
    {
      id: 1,
      name: "Layer 1",
      isLocked: false,
      opacity: 100,
      dataUrl: ""
    }
  ]);
  watch(
    layers,
    () => {
      if (!fabricCanvas.value) return console.warn("watch layers no fabricCanvas");

      fabricCanvas.value.getObjects().forEach((obj) => {
        const layer = layers.value.find((l) => l.id === obj.layerId);
        if (obj.excludeFromExport) return;
        if (!layer) return fabricCanvas.value?.remove(obj);
        obj.set({ opacity: layer.opacity / 100 });
      });

      fabricCanvas.value.renderAll();
    },
    { deep: true }
  );

  function addLayer() {
    const toolStore = useToolStore();

    const newId = layerIdCounter.value++;
    layers.value.push({
      id: newId,
      name: `Layer ${newId}`,
      isLocked: false,
      opacity: 100,
      dataUrl: ""
    });
    activeLayerId.value = newId;

    useSetTool(toolStore.activeTool);
    saveHistory();
  }
  function switchLayer(layer: Layer) {
    if (!fabricCanvas.value) return console.warn("switchLayer no fabricCanvas");
    const toolStore = useToolStore();

    fabricCanvas.value.discardActiveObject();
    fabricCanvas.value.renderAll();
    fabricCanvas.value.selection = false;
    fabricCanvas.value.isDrawingMode = false;

    activeLayerId.value = layer.id;

    useSetTool(toolStore.activeTool);
    saveHistory();
  }
  function toggleLock(layer: Layer, newValue: boolean) {
    if (!fabricCanvas.value) return console.warn("toggleLock no fabricCanvas");
    const toolStore = useToolStore();

    fabricCanvas.value.discardActiveObject();
    fabricCanvas.value.renderAll();
    fabricCanvas.value.selection = false;
    fabricCanvas.value.isDrawingMode = false;

    layer.isLocked = newValue;

    useSetTool(toolStore.activeTool);
    saveHistory();
  }
  function deleteLayer(layer: Layer) {
    if (!fabricCanvas.value) return console.warn("deleteLayer no fabricCanvas");

    layers.value = layers.value.filter((l) => l.id !== layer.id);
    const objectsToRemove = fabricCanvas.value.getObjects().filter((obj) => obj.layerId === layer.id);
    objectsToRemove.forEach((obj) => fabricCanvas.value?.remove(obj));

    if (layers.value.length <= 0)
      layers.value = [
        {
          id: 1,
          name: "Layer 1",
          isLocked: false,
          opacity: 100,
          dataUrl: ""
        }
      ];
    if (activeLayerId.value === layer.id) activeLayerId.value = layers.value[0]!.id;

    saveHistory();
  }

  return {
    fabricCanvas,
    mousePos,
    canvasSize,
    showBoundingRect,
    layerIdCounter,
    activeLayerId,
    layers,
    addLayer,
    switchLayer,
    toggleLock,
    deleteLayer,
    history,
    historyIndex,
    canUndo,
    canRedo,
    saveHistory,
    changeHistory
  };
});
