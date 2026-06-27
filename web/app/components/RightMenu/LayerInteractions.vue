<template>
  <div class="flex w-full items-center justify-around gap-2">
    <GuiButtonGroup class="du-tooltip du-tooltip-bottom" :data-tip="`Toggle Layer Lock (${useGetKeybindString('Toggle Layer Lock')})`">
      <GuiInnerButton image="/icons/lock.svg" label="Lock the current layer" :is-disabled="activeLayer.isLocked" @clicked="canvasStore.toggleLock(activeLayer, true)" />
      <GuiInnerButton image="/icons/unlock.svg" label="Unlock the current layer" :is-disabled="!activeLayer.isLocked" @clicked="canvasStore.toggleLock(activeLayer, false)" />
    </GuiButtonGroup>

    <GuiButtonSingle image="/icons/delete.svg" label="Delete Layer" tooltip-direction="bottom" @clicked="canvasStore.deleteLayer(activeLayer)" />

    <GuiSlider
      name="Layer Opacity"
      image="/icons/eye.svg"
      :custom-button-tooltip="`Layer Opacity (${isMac ? modifierKeySet.meta : modifierKeySet.control} + ${specialKeys.arrowup}/${specialKeys.arrowdown})`"
      button-tooltip-direction="bottom"
      :min="0"
      :max="100"
      v-model="activeLayer.opacity"
      @on-change="canvasStore.saveHistory('none')"
      :tooltip-format="(value) => `${value}%`"
    />
  </div>
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { activeLayer } = storeToRefs(canvasStore);

const userStore = useUserStore();
const { isMac, modifierKeySet } = storeToRefs(userStore);
</script>

<style scoped></style>
