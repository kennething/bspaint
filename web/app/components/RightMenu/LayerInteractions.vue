<template>
  <div class="flex w-full items-center justify-around gap-2">
    <GuiButtonGroup>
      <GuiInnerButton image="/icons/lock.svg" label="Lock the current layer" :is-disabled="activeLayer.isLocked" @clicked="canvasStore.toggleLock(activeLayer, true)" />
      <GuiInnerButton image="/icons/unlock.svg" label="Unlock the current layer" :is-disabled="!activeLayer.isLocked" @clicked="canvasStore.toggleLock(activeLayer, false)" />
    </GuiButtonGroup>

    <GuiButtonSingle image="/icons/delete.svg" label="Delete the active layer" @clicked="canvasStore.deleteLayer(activeLayer)" />

    <GuiSlider name="Layer opacity" image="/icons/eye.svg" :min="0" :max="100" v-model="activeLayer.opacity" @on-change="canvasStore.saveHistory('none')" :tooltip-format="(value) => `${value}%`" />
  </div>
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { layers, activeLayerId } = storeToRefs(canvasStore);

const activeLayer = computed(() => layers.value.find((layer) => layer.id === activeLayerId.value)!);
</script>

<style scoped></style>
