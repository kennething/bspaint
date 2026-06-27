<template>
  <GuiMenu class="flex w-full flex-col items-center justify-center gap-2 p-6">
    <GuiMenu class="w-full rounded-full! px-1 py-0.5 backdrop-blur-none!">
      <button
        @click="newLayer"
        class="du-tooltip du-tooltip-bottom w-full rounded-full px-3 py-2 hover:bg-neutral-200/35"
        :data-tip="`New Layer (${modifierKeySet.control} + ${isMac ? modifierKeySet.alt + ' + ' : ''}${specialKeys.enter})`"
      >
        New Layer
      </button>
    </GuiMenu>

    <div v-auto-animate ref="layers-container" class="hide-scrollbar flex h-100 w-full flex-col-reverse items-center overflow-y-scroll">
      <div
        v-for="(layer, index) in layers"
        :key="layer.id"
        class="du-tooltip flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2"
        :class="layer.id === activeLayerId ? 'bg-neutral-200/65 hover:bg-neutral-300/50' : 'hover:bg-neutral-200/35'"
        :data-tip="`Layer ${layer.id} (${modifierKeySet.control} + ${isMac ? modifierKeySet.alt + ' + ' : ''}${index + 1})`"
        role="button"
        @click="canvasStore.switchLayer(layer)"
      >
        <img :src="layer.dataUrl" aria-hidden="true" class="transparent-sprite-sm h-12 rounded" />

        <div class="flex w-full items-center justify-center gap-1">
          <img v-if="layer.isLocked" src="/icons/lock.svg" alt="This layer is locked" />
          <h3 class="text-lg font-medium">{{ layer.name }}</h3>
        </div>
      </div>
    </div>

    <div class="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2 hover:bg-neutral-200/35" role="button" @click="showColorPicker = true">
      <div class="h-12 w-20 rounded-xl" :style="{ backgroundColor }"></div>

      <div class="flex w-full items-center justify-center gap-1">
        <img src="/icons/lock.svg" alt="This layer is locked" />
        <h3 class="text-lg font-medium">Background</h3>
      </div>
    </div>
  </GuiMenu>

  <ColorPicker v-if="showColorPicker" @close="showColorPicker = false" editing-color="background" />
</template>

<script setup lang="ts">
const layersContainer = useTemplateRef("layers-container");

const canvasStore = useCanvasStore();
const { layers, activeLayerId, triggerNewLayer } = storeToRefs(canvasStore);

const toolStore = useToolStore();
const { backgroundColor } = storeToRefs(toolStore);

const userStore = useUserStore();
const { isMac, modifierKeySet } = storeToRefs(userStore);

const showColorPicker = ref(false);

async function newLayer() {
  canvasStore.addLayer();
  await nextTick();
  layersContainer.value?.scrollTo({ behavior: "smooth", top: -layersContainer.value.scrollHeight });
}
watch(triggerNewLayer, (val) => {
  if (val) newLayer();
});
</script>

<style scoped></style>
