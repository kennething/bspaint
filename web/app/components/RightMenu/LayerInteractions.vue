<template>
  <div class="flex w-full items-center justify-around gap-2">
    <GuiMenu class="flex items-center justify-center gap-0.5 rounded-full! px-0.5">
      <button
        @click="canvasStore.toggleLock(activeLayer, true)"
        class="flex w-8 items-center justify-center rounded-full p-1"
        :class="activeLayer.isLocked ? 'bg-neutral-200/90 hover:bg-neutral-300/75' : 'hover:bg-neutral-200/50'"
        aria-label="Lock the active layer"
      >
        <img class="size-5" src="/icons/lock.svg" aria-hidden="true" />
      </button>
      <button
        @click="canvasStore.toggleLock(activeLayer, false)"
        class="flex w-8 items-center justify-center rounded-full p-1"
        :class="activeLayer.isLocked ? 'hover:bg-neutral-200/50' : 'bg-neutral-200/90 hover:bg-neutral-300/75'"
        aria-label="Unlock the active layer"
      >
        <img class="size-5" src="/icons/unlock.svg" aria-hidden="true" />
      </button>
    </GuiMenu>

    <GuiMenu class="flex items-center justify-center rounded-full! px-0.5">
      <button @click="canvasStore.deleteLayer(activeLayer)" class="flex w-8 items-center justify-center rounded-full p-1 hover:bg-neutral-200/50" aria-label="Delete the active layer">
        <img class="size-5" src="/icons/delete.svg" aria-hidden="true" />
      </button>
    </GuiMenu>

    <!-- TODO: style this -->
    <GuiMenu class="flex w-full items-center justify-center gap-1 rounded-full! px-0.5">
      <img class="size-7 p-1" :src="activeLayer.opacity === 0 ? '/icons/eye-off.svg' : '/icons/eye.svg'" aria-hidden="true" />
      <input class="w-full" type="range" min="0" max="100" v-model="activeLayer.opacity" @change.stop="canvasStore.saveHistory" />
    </GuiMenu>
  </div>
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { layers, activeLayerId } = storeToRefs(canvasStore);

const activeLayer = computed(() => layers.value.find((layer) => layer.id === activeLayerId.value)!);
</script>

<style scoped></style>
