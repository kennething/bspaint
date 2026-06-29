<template>
  <div v-if="activeTool === 'select' && selectedObject" class="flex flex-col items-center justify-center gap-2">
    <GuiMenu class="flex w-full flex-col items-center justify-center gap-2 p-6">
      <GuiInput v-model="selectWidth" name="Width" model-type="number" inner-class="w-full" />
      <GuiInput v-model="selectHeight" name="Height" model-type="number" inner-class="w-full" />
      <GuiInput v-model="selectX" name="X-Position" model-type="number" inner-class="w-full" />
      <GuiInput v-model="selectY" name="Y-Position" model-type="number" inner-class="w-full" />
      <GuiSlider
        v-model="selectScaleX"
        is-skewed
        name="X-Scale"
        image="/icons/scale-x.svg"
        :tooltip-format="(value) => `${value.toFixed(2)}x`"
        button-tooltip-direction="top"
        tooltip-position="top"
        :min="0.01"
        :max="100"
      />
      <GuiSlider
        v-model="selectScaleY"
        is-skewed
        name="Y-Scale"
        image="/icons/scale-y.svg"
        :tooltip-format="(value) => `${value.toFixed(2)}x`"
        button-tooltip-direction="top"
        tooltip-position="top"
        :min="0.01"
        :max="100"
      />
      <GuiSlider v-model="selectAngle" name="Rotation" image="/icons/rotation.svg" :tooltip-format="(value) => `${value}°`" button-tooltip-direction="top" tooltip-position="top" :min="0" :max="360" />
    </GuiMenu>

    <GuiMenu class="flex w-full flex-col items-center justify-center gap-2 p-6" v-if="selectedObjectIsPath">
      <LeftMenuModifiersBrushSize v-model="selectBrushSize" />
    </GuiMenu>
    <GuiMenu class="flex w-full flex-col items-center justify-center gap-2 p-6" v-else-if="selectedObjectIsText">
      <LeftMenuModifiersFontSize v-model="selectFontSize" />
      <LeftMenuModifiersFontFamily v-model="selectFontFamily" />
    </GuiMenu>
    <GuiMenu class="flex w-full flex-col items-center justify-center gap-2 p-6" v-else-if="selectedObjectIsShape">
      <LeftMenuModifiersStrokeWidth v-model="selectStrokeWidth" />
      <LeftMenuModifiersCornerRadius v-if="!!(selectedObject instanceof Rect)" v-model="selectCornerRadius" />
    </GuiMenu>

    <LeftMenuModifiersColors v-if="selectedObjectIsShape" primary-tooltip="Fill" secondary-tooltip="Stroke" />
    <LeftMenuModifiersColors v-else single-color v-model="selectColor" />
  </div>

  <div v-else-if="activeTool === 'brush'" class="flex flex-col items-center justify-center gap-2">
    <GuiMenu class="flex w-full flex-col items-center justify-center gap-2 p-6">
      <LeftMenuModifiersBrushSize v-model="brushSize" />
    </GuiMenu>
    <LeftMenuModifiersColors />
  </div>

  <div v-else-if="activeTool === 'text'" class="flex flex-col items-center justify-center gap-2">
    <GuiMenu class="flex w-full flex-col items-center justify-center gap-2 p-6">
      <LeftMenuModifiersFontSize v-model="fontSize" />
      <LeftMenuModifiersFontFamily v-model="fontFamily" />
    </GuiMenu>
    <LeftMenuModifiersColors />
  </div>

  <LeftMenuModifiersColors v-else-if="activeTool === 'eyedropper'" />

  <div v-else-if="activeTool === 'shape'" class="flex flex-col items-center justify-center gap-2">
    <GuiMenu class="flex w-full flex-col items-center justify-center gap-2 p-6">
      <GuiButtonGroup class="w-full!">
        <GuiInnerButton class="grow" image="/icons/square.svg" label="Square" @clicked="selectedShape = 'rectangle'" :is-active="selectedShape === 'rectangle'" tooltip-direction="top" />
        <GuiInnerButton class="grow" image="/icons/circle.svg" label="Circle" @clicked="selectedShape = 'circle'" :is-active="selectedShape === 'circle'" tooltip-direction="top" />
        <GuiInnerButton class="grow" image="/icons/triangle.svg" label="Triangle" @clicked="selectedShape = 'triangle'" :is-active="selectedShape === 'triangle'" tooltip-direction="top" />
      </GuiButtonGroup>
      <LeftMenuModifiersStrokeWidth v-model="strokeWidth" />
      <LeftMenuModifiersCornerRadius v-if="selectedShape === 'rectangle'" v-model="cornerRadius" />
    </GuiMenu>
    <LeftMenuModifiersColors primary-tooltip="Fill" secondary-tooltip="Stroke" />
  </div>
</template>

<script setup lang="ts">
import { Ellipse, IText, Path, Rect, Triangle } from "fabric";

// TODO: change properties of all selected objects instead of just 1
const canvasStore = useCanvasStore();
const { fabricCanvas: canvas } = storeToRefs(canvasStore);
const toolStore = useToolStore();
const { activeTool, brushSize, fontFamily, fontSize, selectedObject, stopWatchers, selectedObjectChangedEvent, strokeWidth, cornerRadius, selectedShape } = storeToRefs(toolStore);

watch(brushSize, () => useBrushPreview());
watch(fontSize, () => useTextPreview());

const selectWidth = ref(0);
const selectHeight = ref(0);
const selectScaleX = ref(1);
const selectScaleY = ref(1);
const selectX = ref(0);
const selectY = ref(0);
const selectAngle = ref(0);
const selectColor = ref("#000000");
const selectSecondaryColor = ref("#000000");
const selectBrushSize = ref(brushSize.value);
const selectFontSize = ref(fontSize.value);
const selectFontFamily = ref(fontFamily.value);
const selectStrokeWidth = ref(strokeWidth.value);
const selectCornerRadius = ref(cornerRadius.value);

const selectedObjectIsPath = computed(() => selectedObject.value instanceof Path);
const selectedObjectIsText = computed(() => selectedObject.value instanceof IText);
const selectedObjectIsShape = computed(() => selectedObject.value instanceof Rect || selectedObject.value instanceof Ellipse || selectedObject.value instanceof Triangle);

watch(selectedObject, (newObject) => {
  if (!newObject) return;

  selectWidth.value = newObject.width ?? 0;
  selectHeight.value = newObject.height ?? 0;
  selectScaleX.value = newObject.scaleX ?? 1;
  selectScaleY.value = newObject.scaleY ?? 1;
  selectX.value = newObject.left ?? 0;
  selectY.value = newObject.top ?? 0;
  selectAngle.value = newObject.angle ?? 0;
  if (newObject instanceof Path) {
    selectBrushSize.value = newObject.strokeWidth ?? brushSize.value;
    selectColor.value = newObject.stroke?.toString() ?? "#000000";
  } else if (newObject instanceof IText) {
    selectFontSize.value = newObject.fontSize ?? fontSize.value;
    selectFontFamily.value = (newObject.fontFamily as FontFamily) ?? fontFamily.value;
    selectColor.value = newObject.fill?.toString() ?? "#000000";
  } else if (newObject instanceof Rect || newObject instanceof Ellipse || newObject instanceof Triangle) {
    selectColor.value = newObject.fill?.toString() ?? "#000000";
    selectSecondaryColor.value = newObject.stroke?.toString() ?? "#000000";
    selectStrokeWidth.value = newObject.strokeWidth ?? strokeWidth.value;
    if (newObject instanceof Rect) selectCornerRadius.value = newObject.rx ?? cornerRadius.value;
  }

  const stopMoveWatching = selectedObject.value!.on("moving", () => {
    selectX.value = selectedObject.value!.left ?? 0;
    selectY.value = selectedObject.value!.top ?? 0;
  });
  const stopScaleWatching = selectedObject.value!.on("scaling", () => {
    selectScaleX.value = selectedObject.value!.scaleX ?? 1;
    selectScaleY.value = selectedObject.value!.scaleY ?? 1;
    selectWidth.value = selectedObject.value!.width ?? 0;
    selectHeight.value = selectedObject.value!.height ?? 0;
  });
  const stopRotateWatching = selectedObject.value!.on("rotating", () => {
    selectAngle.value = selectedObject.value!.angle ?? 0;
  });
  stopWatchers.value.push(stopMoveWatching, stopScaleWatching, stopRotateWatching);
});

watch(selectedObjectChangedEvent, (val) => {
  if (!val) return;

  if (selectedObjectIsPath.value) selectBrushSize.value = selectedObject.value!.strokeWidth ?? brushSize.value;
  else if (selectedObjectIsText.value) selectFontSize.value = (selectedObject.value as IText).fontSize ?? fontSize.value;
  else if (selectedObjectIsShape.value) {
    selectColor.value = selectedObject.value!.fill?.toString() ?? "#000000";
    selectSecondaryColor.value = selectedObject.value!.stroke?.toString() ?? "#000000";
    selectStrokeWidth.value = selectedObject.value!.strokeWidth ?? strokeWidth.value;
    if (selectedObject.value instanceof Rect) selectCornerRadius.value = selectedObject.value.rx ?? cornerRadius.value;
  }
});

watch(selectWidth, (newWidth) => {
  // TODO: add option to snap everything to grid
  if (newWidth === selectedObject.value!.width) return;
  if (selectedObject.value) selectedObject.value.set({ width: newWidth });
  selectedObject.value?.setCoords();
  canvas.value?.requestRenderAll();
});
watch(selectHeight, (newHeight) => {
  if (newHeight === selectedObject.value!.height) return;
  if (selectedObject.value) selectedObject.value.set({ height: newHeight });
  selectedObject.value?.setCoords();
  canvas.value?.requestRenderAll();
});
watch(selectScaleX, (newScaleX) => {
  if (newScaleX === selectedObject.value!.scaleX) return;
  if (selectedObject.value) selectedObject.value.set({ scaleX: newScaleX });
  selectedObject.value?.setCoords();
  canvas.value?.requestRenderAll();
});
watch(selectScaleY, (newScaleY) => {
  if (newScaleY === selectedObject.value!.scaleY) return;
  if (selectedObject.value) selectedObject.value.set({ scaleY: newScaleY });
  selectedObject.value?.setCoords();
  canvas.value?.requestRenderAll();
});
watch(selectX, (newX) => {
  if (newX === selectedObject.value!.left) return;
  if (selectedObject.value) selectedObject.value.set({ left: newX });
  selectedObject.value?.setCoords();
  canvas.value?.requestRenderAll();
});
watch(selectY, (newY) => {
  if (newY === selectedObject.value!.top) return;
  if (selectedObject.value) selectedObject.value.set({ top: newY });
  selectedObject.value?.setCoords();
  canvas.value?.requestRenderAll();
});
watch(selectAngle, (newAngle) => {
  if (newAngle === selectedObject.value!.angle) return;
  if (selectedObject.value) selectedObject.value.set({ angle: newAngle });
  selectedObject.value?.setCoords();
  canvas.value?.requestRenderAll();
});
watch(selectColor, (newColor) => {
  if (selectedObjectIsPath.value) selectedObject.value!.set({ stroke: newColor });
  else if (selectedObjectIsText.value) selectedObject.value!.set({ fill: newColor });
  else if (selectedObjectIsShape.value) selectedObject.value!.set({ fill: newColor });
  canvas.value?.requestRenderAll();
});
watch(selectSecondaryColor, (newColor) => {
  if (selectedObjectIsShape.value) selectedObject.value!.set({ stroke: newColor });
  canvas.value?.requestRenderAll();
});
watch(selectBrushSize, (newSize) => {
  if (selectedObjectIsPath.value) selectedObject.value!.set({ strokeWidth: newSize });
  canvas.value?.requestRenderAll();
});
watch(selectFontSize, (newSize) => {
  if (selectedObjectIsText.value) selectedObject.value!.set({ fontSize: newSize });
  canvas.value?.requestRenderAll();
});
watch(selectFontFamily, (newFamily) => {
  if (selectedObjectIsText.value) selectedObject.value!.set({ fontFamily: newFamily });
  canvas.value?.requestRenderAll();
});
watch(selectStrokeWidth, (newWidth) => {
  if (selectedObjectIsShape.value) selectedObject.value!.set({ strokeWidth: newWidth });
  canvas.value?.requestRenderAll();
});
watch(selectCornerRadius, (newRadius) => {
  if (selectedObject.value instanceof Rect) selectedObject.value!.set({ rx: newRadius, ry: newRadius });
  canvas.value?.requestRenderAll();
});
</script>

<style scoped></style>
