<template>
  <GuiMenu class="flex w-full flex-col items-center justify-center" :class="isMac ? 'gap-2 p-6' : 'px-6 py-2'">
    <GuiMenu class="w-full" :class="isMac ? 'rounded-full! px-1 py-0.5 backdrop-blur-none!' : 'transition duration-500 hover:border-blue-300!'">
      <button
        @click="newLayer"
        class="du-tooltip du-tooltip-bottom w-full"
        :class="isMac ? 'rounded-full px-3 py-2 hover:bg-neutral-200/35' : 'p-1 transition duration-500 hover:bg-sky-100'"
        :data-tip="`New Layer (${isMac ? modifierKeySet.control + ' + ' : ''}${modifierKeySet.alt} + ${specialKeys.enter})`"
      >
        New Layer
      </button>
    </GuiMenu>

    <div v-auto-animate ref="layers-container" class="hide-scrollbar flex h-100 w-full flex-col-reverse items-center overflow-y-scroll" :class="{ 'bg-sky-lighter/75': !isMac }">
      <div
        v-for="(layer, index) in layers"
        :key="layer.id"
        class="du-tooltip flex w-full items-center justify-center gap-3 px-3 py-2"
        :class="[
          { 'rounded-xl': isMac },
          isMac && layer.id === activeLayerId ? 'bg-neutral-200/65 hover:bg-neutral-300/50' : 'hover:bg-neutral-200/35',
          !isMac && layer.id === activeLayerId ? 'bg-neutral-300 hover:bg-neutral-400/50' : 'bg-neutral-300/35 hover:bg-neutral-300/65'
        ]"
        :data-tip="`Layer ${layer.id} (${isMac ? modifierKeySet.control + ' + ' : ''}${modifierKeySet.alt} + ${index + 1})`"
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

    <div
      class="flex w-full items-center justify-center gap-3 px-3 py-2"
      :class="isMac ? 'rounded-xl hover:bg-neutral-200/35' : 'bg-neutral-300/35 hover:bg-neutral-300/65'"
      role="button"
      @click="showColorPicker = true"
    >
      <div class="transparent-sprite-xs h-12 w-20 overflow-hidden" :class="isMac ? 'rounded-xl' : 'rounded'">
        <div class="h-full w-full" :style="{ backgroundColor }"></div>
      </div>

      <div class="flex w-full items-center justify-center gap-1">
        <img src="/icons/lock.svg" alt="This layer is locked" />
        <h3 class="text-lg font-medium">Background</h3>
      </div>
    </div>
  </GuiMenu>

  <ColorPicker v-if="showColorPicker" v-model="backgroundColor" allow-transparency @close="closeColorPicker" />
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

function closeColorPicker() {
  useHandleResize();
  showColorPicker.value = false;
}
</script>

<style scoped></style>
