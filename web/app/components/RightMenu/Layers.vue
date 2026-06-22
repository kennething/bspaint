<template>
  <GuiMenu class="flex h-full w-full flex-col items-center justify-center gap-2 p-6">
    <button @click="canvasStore.addLayer" class="w-full rounded-xl px-3 py-2 hover:bg-neutral-200/35">New Layer</button>

    <div
      v-for="layer in layers.toReversed()"
      class="flex w-full flex-col items-center justify-center gap-2 rounded-xl px-3 py-2"
      :class="layer.id === activeLayerId ? 'bg-neutral-200/65 hover:bg-neutral-300/50' : 'hover:bg-neutral-200/35'"
      role="button"
      @click="canvasStore.switchLayer(layer)"
    >
      <div class="flex w-full items-center justify-center gap-3">
        <img :src="layer.dataUrl" aria-hidden="true" class="transparent-sprite h-12" />

        <div class="flex w-full items-center justify-center gap-1">
          <img v-if="layer.isLocked" src="/icons/lock.svg" alt="This layer is locked" />
          <h3 class="text-lg font-medium">{{ layer.name }}</h3>
        </div>
      </div>
    </div>
  </GuiMenu>
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { layers, activeLayerId } = storeToRefs(canvasStore);
</script>

<style scoped>
.transparent-sprite {
  background: conic-gradient(#ddd 25%, #fff 0 50%, #ddd 0 75%, #fff 0) 0 0 / 1rem 1rem;
}
</style>
