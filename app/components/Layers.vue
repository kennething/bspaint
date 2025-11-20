<template>
  <div
    class="hide-scrollbar flex max-h-[90dvh] w-80 -translate-y-1/2 cursor-auto flex-col-reverse items-center justify-start gap-2 overflow-y-scroll rounded-l-xl bg-white/75 p-4 pt-10 pb-12 transition-opacity duration-500 select-none *:select-none"
    :class="{ 'pointer-events-none opacity-25': isTransparentUI }"
  >
    <button
      :disabled="isEditing"
      @click="createNewLayer"
      class="flex w-full items-center justify-center gap-4 rounded-xl px-6 py-2 hover:bg-neutral-200/50"
      :class="{ 'cursor-not-allowed! opacity-50 hover:bg-transparent!': isEditing }"
    >
      <img src="/icons/plus.svg" class="size-6" />
      <p class="grow text-left">Add Layer</p>
    </button>
    <div
      role="button"
      v-for="(layer, index) in layers"
      @click="layerIndex = index"
      class="flex w-full items-center justify-start gap-2 rounded-xl px-3 py-2 hover:bg-neutral-200/50"
      :class="{ 'bg-neutral-200/75 hover:bg-neutral-200/75': layerIndex === index }"
    >
      <button @click.stop="layer.isVisible = !layer.isVisible" class="du-tooltip rounded-full p-1 hover:bg-neutral-300/50" :data-tip="layer.isVisible ? 'Hide' : 'Show'">
        <img class="size-4.5" :src="`/icons/eye-${layer.isVisible ? 'on' : 'off'}.svg`" aria-hidden="true" />
      </button>

      <img :src="layer.dataUrl" class="max-h-10 max-w-20" aria-hidden="true" :class="{ 'border border-dotted': layerIndex === index }" :style="{ backgroundColor: currentColor.secondary }" />
      <p class="grow text-left">Layer {{ index + 1 }}</p>

      <button
        :disabled="layerIndex === index && isEditing"
        @click.stop="layer.isLocked = false"
        class="du-tooltip me-auto rounded-full p-1.5 hover:bg-neutral-300/50"
        :class="{ 'cursor-not-allowed! opacity-50 hover:bg-transparent!': layerIndex === index && isEditing }"
        data-tip="Unlock"
        v-if="layer.isLocked"
      >
        <img class="size-6" src="/icons/lock.svg" aria-hidden="true" />
      </button>
    </div>

    <div class="flex w-full items-center justify-between rounded-xl bg-neutral-200/75 px-3 py-6" v-if="currentLayer">
      <div class="flex grow px-6">
        <div class="du-tooltip du-tooltip-bottom flex flex-col items-start justify-center gap-1" :data-tip="currentLayer.opacity + '%'">
          <div>
            <label for="stroke-size" class="text-xs text-neutral-700 capitalize">Opacity</label>
            <input
              ref="brush-size-number-input"
              type="number"
              @focus="isInModiferBar = true"
              @blur="submitNewOpacity"
              @keydown.enter="submitNewOpacity"
              class="ms-5 w-10 text-sm"
              min="0"
              max="100"
              v-model="currentLayer.opacity"
              tabindex="-1"
            />
          </div>
          <input
            id="stroke-size"
            class="du-range du-range-xs text-blue-400 [--range-bg:cyan] [--range-fill:0] [--range-thumb:blue]"
            type="range"
            min="0"
            max="100"
            v-model="currentLayer.opacity"
            tabindex="-1"
          />
        </div>
      </div>

      <div class="flex items-center justify-center gap-1">
        <button @click="currentLayer.isVisible = !currentLayer.isVisible" class="du-tooltip rounded-full p-1.5 hover:bg-neutral-300/50" :data-tip="currentLayer.isVisible ? 'Hide' : 'Show'">
          <img :src="`/icons/eye-${currentLayer.isVisible ? 'on' : 'off'}.svg`" aria-hidden="true" />
        </button>

        <button
          :disabled="isEditing"
          @click="currentLayer.isLocked = !currentLayer.isLocked"
          class="du-tooltip rounded-full p-1.5 hover:bg-neutral-300/50"
          :class="{ 'cursor-not-allowed! opacity-50 hover:bg-transparent!': isEditing }"
          :data-tip="currentLayer.isLocked ? 'Unlock' : 'Lock'"
        >
          <img :src="`/icons/${!currentLayer.isLocked ? 'un' : ''}lock.svg`" aria-hidden="true" />
        </button>

        <button
          :disabled="currentLayer.isLocked || isEditing"
          :class="{ 'cursor-not-allowed! opacity-50 hover:bg-transparent!': currentLayer.isLocked || isEditing || layerIndex === 0 }"
          @click="deleteLayer"
          class="du-tooltip rounded-full p-1.5 hover:bg-neutral-300/50"
          :data-tip="currentLayer.isLocked ? 'Locked!' : 'Delete'"
        >
          <img src="/icons/delete.svg" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { canvasSize, currentTool, tools, currentColor, layers, layerIndex, isTransparentUI, isInModiferBar } = storeToRefs(userStore);

const isEditing = computed(() => (currentTool.value === "select" && tools.value.select.selectState === "selected") || (currentTool.value === "text" && tools.value.text.isTyping));

const currentLayer = computed(() => layers.value[layerIndex.value]);

function createNewLayer() {
  if (isEditing.value) return;

  const canvas = document.createElement("canvas");
  canvas.width = canvasSize.value[0];
  canvas.height = canvasSize.value[1];

  layers.value.push({
    dataUrl: canvas.toDataURL(),
    isVisible: true,
    isLocked: false,
    opacity: 100
  });
  layerIndex.value = layers.value.length - 1;
}

function deleteLayer() {
  if (layerIndex.value === 0) return;
  layers.value.splice(layerIndex.value, 1);
  layerIndex.value--;
}

function submitNewOpacity() {
  if (!currentLayer.value) return;
  isInModiferBar.value = false;

  if (!currentLayer.value.opacity) currentLayer.value.opacity = 0;
  if (currentLayer.value.opacity > 100) currentLayer.value.opacity = 100;
}
</script>

<style scoped></style>
