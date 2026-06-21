import { Color, type Canvas } from "fabric";

export type Layer = {
  id: number;
  name: string;
  isLocked: boolean;
  opacity: number;
  isBackground?: boolean;
};

export const useCanvasStore = defineStore("canvasStore", () => {
  const fabricCanvas = markRaw(ref<Canvas>());

  const layerIdCounter = ref(2);
  const activeLayerId = ref(1);

  const layers = ref<Layer[]>([
    {
      id: 1,
      name: "Background",
      isLocked: true,
      opacity: 1,
      isBackground: true
    }
  ]);

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
  function toggleLock(layer: Layer) {
    const toolStore = useToolStore();
    layer.isLocked = !layer.isLocked;
    useSetTool(toolStore.activeTool);
  }
  function updateLayerOpacity(layer: Layer, opacity: number) {
    if (!fabricCanvas.value) return console.warn("updateLayerOpacity no fabricCanvas");

    const toolStore = useToolStore();

    if (layer.isBackground) fabricCanvas.value.backgroundColor = new Color(toolStore.primaryColor).setAlpha(layer.opacity).toRgba();
    else
      fabricCanvas.value.forEachObject((obj) => {
        if (obj.layerId === layer.id) obj.set({ opacity: layer.opacity });
      });

    fabricCanvas.value.renderAll();
  }
  function deleteLayer(layer: Layer) {
    if (!fabricCanvas.value) return console.warn("deleteLayer no fabricCanvas");
    if (layer.isBackground) return;

    layers.value = layers.value.filter((l) => l.id !== layer.id);
    const objectsToRemove = fabricCanvas.value.getObjects().filter((obj) => obj.layerId === layer.id);
    objectsToRemove.forEach((obj) => fabricCanvas.value?.remove(obj));

    if (layers.value.length <= 0) {
      layers.value = [
        {
          id: 1,
          name: "Background",
          isLocked: true,
          opacity: 1,
          isBackground: true
        }
      ];
      console.error("wtf howd u delete the background");
    }
    if (activeLayerId.value === layer.id) activeLayerId.value = layers.value[0]!.id;
  }

  return { fabricCanvas, layerIdCounter, activeLayerId, layers, addLayer, toggleLock, updateLayerOpacity, deleteLayer };
});
