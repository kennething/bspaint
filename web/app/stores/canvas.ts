import { Color, type Canvas } from "fabric";

export type Layer = {
  id: number;
  name: string;
  isLocked: boolean;
  opacity: number;
};

export const useCanvasStore = defineStore("canvasStore", () => {
  const fabricCanvas = markRaw(ref<Canvas>());

  const layerIdCounter = ref(1);
  const activeLayerId = ref(1);

  const layers = ref<Layer[]>([
    {
      id: 1,
      name: "Layer 1",
      isLocked: false,
      opacity: 100
    }
  ]);
  watch(
    layers,
    (newLayers, oldLayers) => {
      if (!fabricCanvas.value) return console.warn("watch layers no fabricCanvas");

      const layerDiff = newLayers.filter((newLayer) => !oldLayers.some((oldLayer) => oldLayer.opacity === newLayer.opacity));
      console.log(newLayers[0]?.opacity, oldLayers[0]?.opacity);
      layerDiff.forEach((layer) => {
        fabricCanvas.value?.getObjects().forEach((obj) => {
          if (obj.layerId === layer.id) obj.set({ opacity: layer.opacity });
        });
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
      opacity: 1
    });
    activeLayerId.value = newId;

    useSetTool(toolStore.activeTool);
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
  }
  function toggleLock(layer: Layer) {
    if (!fabricCanvas.value) return console.warn("switchLayer no fabricCanvas");
    const toolStore = useToolStore();

    fabricCanvas.value.discardActiveObject();
    fabricCanvas.value.renderAll();
    fabricCanvas.value.selection = false;
    fabricCanvas.value.isDrawingMode = false;

    layer.isLocked = !layer.isLocked;

    useSetTool(toolStore.activeTool);
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
          opacity: 1
        }
      ];
    if (activeLayerId.value === layer.id) activeLayerId.value = layers.value[0]!.id;
  }

  return { fabricCanvas, layerIdCounter, activeLayerId, layers, addLayer, switchLayer, toggleLock, deleteLayer };
});
