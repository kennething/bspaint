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
  canvasSize: {
    width: number;
    height: number;
  };
  layerIdCounter: number;
  activeLayerId: number;
};

export const useCanvasStore = defineStore("canvasStore", () => {
  const fabricCanvas = markRaw(shallowRef<Canvas>());
  const mousePos = reactive({ x: 0, y: 0 });
  const canvasSize = reactive({ width: 0, height: 0 });
  const showBoundingRect = ref(true);

  const isExportingOpen = ref(false);
  const isResizingOpen = ref(false);
  const isHelpOpen = ref(false);

  const layerIdCounter = ref(2);
  const activeLayerId = ref(1);

  const history = ref<HistoryEntry[]>([]);
  const historyIndex = ref(-1);
  const isHistoryProcessing = ref(false);
  const canUndo = computed(() => !isHistoryProcessing.value && historyIndex.value > 0);
  const canRedo = computed(() => !isHistoryProcessing.value && historyIndex.value < history.value.length - 1);

  async function saveHistory(redrawLayerType: "all" | "active" | "none" = "active") {
    if (isHistoryProcessing.value || !fabricCanvas.value) return;

    if (redrawLayerType !== "none") redrawLayerPreview(redrawLayerType);

    const jsonObjects = JSON.stringify(fabricCanvas.value.toDatalessJSON(["layerId", "uuid"]));
    const jsonLayers = JSON.stringify(layers.value);
    if (historyIndex.value < history.value.length - 1) history.value.splice(historyIndex.value + 1);

    history.value.push({
      objects: jsonObjects,
      layers: jsonLayers,
      canvasSize: { ...canvasSize },
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
    layers.value = JSON.parse(historyEntry.layers);
    canvasSize.width = historyEntry.canvasSize.width;
    canvasSize.height = historyEntry.canvasSize.height;
    layerIdCounter.value = historyEntry.layerIdCounter;
    activeLayerId.value = historyEntry.activeLayerId;
    useRedrawBoundingRect();
    redrawLayerPreview("active");
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
  const activeLayer = computed(() => layers.value.find((layer) => layer.id === activeLayerId.value)!);
  const triggerNewLayer = ref(false);
  watch(triggerNewLayer, async (val) => {
    if (val) {
      await nextTick();
      triggerNewLayer.value = false;
    }
  });

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

    const layerIndex = layers.value.findIndex((l) => l.id === layer.id);
    layers.value = layers.value.filter((l) => l.id !== layer.id);
    const objectsToRemove = fabricCanvas.value.getObjects().filter((obj) => obj.layerId === layer.id);
    objectsToRemove.forEach((obj) => fabricCanvas.value?.remove(obj));

    if (layers.value.length <= 0)
      layers.value = [
        {
          id: layerIdCounter.value,
          name: `Layer ${layerIdCounter.value++}`,
          isLocked: false,
          opacity: 100,
          dataUrl: ""
        }
      ];
    if (activeLayerId.value === layer.id) activeLayerId.value = (layers.value[layerIndex] ?? layers.value[layers.value.length - 1]!).id;

    saveHistory();
  }
  async function redrawLayerPreview(type: "all" | "active") {
    if (!fabricCanvas.value) return console.warn("redrawLayerPreview no fabricCanvas");

    const canvasClone = await fabricCanvas.value.clone(["layerId", "uuid"]);
    canvasClone.backgroundColor = "transparent";

    if (type === "active") {
      canvasClone.forEachObject((obj) => {
        if (!obj.excludeFromExport && obj.layerId !== activeLayerId.value) canvasClone.remove(obj);
        obj.opacity = 1;
      });
      activeLayer.value.dataUrl = canvasClone.toDataURL({
        format: "webp",
        multiplier: 1,
        top: 0,
        left: 0,
        width: canvasSize.width,
        height: canvasSize.height
      });
    } // active
    else {
      for (const layer of layers.value) {
        if (layer.opacity === 0) continue;

        canvasClone.forEachObject((obj) => {
          obj.opacity = obj.excludeFromExport || obj.layerId !== layer.id ? 0 : 1;
        });
        layer.dataUrl = canvasClone.toDataURL({
          format: "webp",
          multiplier: 1,
          top: 0,
          left: 0,
          width: canvasSize.width,
          height: canvasSize.height
        });
      }
    } // all
    canvasClone.dispose();
  }

  return {
    fabricCanvas,
    mousePos,
    canvasSize,
    showBoundingRect,
    isExportingOpen,
    isResizingOpen,
    isHelpOpen,
    layerIdCounter,
    activeLayerId,
    layers,
    activeLayer,
    triggerNewLayer,
    addLayer,
    switchLayer,
    toggleLock,
    deleteLayer,
    redrawLayerPreview,
    history,
    historyIndex,
    canUndo,
    canRedo,
    saveHistory,
    changeHistory
  };
});
