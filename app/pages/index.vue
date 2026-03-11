<template>
  <div class="flex h-full min-h-dvh w-full min-w-dvw items-start justify-start pt-30 pl-60">
    <Teleport to="body">
      <Toolbar class="fixed top-0 z-100" />

      <div class="fixed top-1/2 right-0 z-100 flex -translate-y-1/2 flex-col items-end justify-center" :class="{ 'pointer-events-none': isTransparentUI }">
        <button
          class="du-swap du-swap-rotate du-tooltip-left du-tooltip rounded-tl-2xl bg-white/75 px-2 transition-opacity duration-500"
          :class="{ 'pointer-events-none opacity-25': isTransparentUI, 'du-swap-active rounded-l-2xl!': !showLayerPanel }"
          :data-tip="`${showLayerPanel ? 'Hide' : 'Show'} layers (L)`"
          @click="showLayerPanel = !showLayerPanel"
        >
          <img class="du-swap-on size-10" src="/icons/return-left.svg" aria-hidden="true" draggable="false" />
          <img class="du-swap-off size-10" src="/icons/return-right.svg" aria-hidden="true" draggable="false" />
        </button>
        <Layers :class="{ 'pointer-events-none opacity-0': !showLayerPanel }" />
      </div>

      <div class="fixed bottom-0 left-0 z-100 flex items-center justify-center gap-4">
        <button
          class="rounded-tr-xl bg-red-200/75 px-6 py-2 font-bold transition select-none hover:bg-red-200"
          :class="{ 'pointer-events-none opacity-25': isTransparentUI }"
          @click="isCreatingNewCanvas = !isCreatingNewCanvas"
          tabindex="-1"
        >
          New Canvas
        </button>
        <button
          class="rounded-t-xl bg-green-200/75 px-6 py-2 font-bold transition select-none hover:bg-green-200"
          @click="copyImage"
          :class="{ 'pointer-events-none opacity-25': isTransparentUI }"
          tabindex="-1"
        >
          Copy Image
        </button>
      </div>

      <Transition>
        <div
          class="fixed top-1/2 left-1/2 z-110 flex w-96 -translate-x-1/2 -translate-y-1/2 cursor-default flex-col items-center justify-center rounded-xl border-2 bg-white p-6 shadow-2xl"
          v-show="isCreatingNewCanvas"
        >
          <h3 class="text-2xl font-semibold">Create New Canvas</h3>
          <p class="text-center text-sm">You can paste an image directly into this thing!!!</p>
          <p class="text-center text-xs font-thin text-neutral-400">Your current canvas will die and will not be saved due to the rookie mistake of not having health insurance.</p>

          <div class="mt-6 flex grow items-center justify-center gap-2">
            <label for="width" class="shrink-0 text-sm font-medium">Width (px)</label>
            <input id="width" class="du-input du-input-sm grow dark:text-neutral-200" type="number" min="1" max="9999" v-model="width" @keydown.stop />
          </div>
          <div class="mt-2 flex grow items-center justify-center gap-2">
            <label for="height" class="shrink-0 text-sm font-medium">Height (px)</label>
            <input id="height" class="du-input du-input-sm grow dark:text-neutral-200" type="number" min="1" max="9999" v-model="height" @keydown.stop />
          </div>

          <div class="mt-6 flex w-full items-center justify-between gap-2">
            <button class="grow rounded-xl border-2 border-neutral-200 bg-neutral-200 py-2 text-lg font-semibold transition hover:border-neutral-300 hover:bg-neutral-300" @click="createNew(true)">
              Create
            </button>
            <button class="grow rounded-xl border-2 border-neutral-200 py-2 text-lg font-semibold transition hover:bg-neutral-200" @click="createNew(false)">Wait No</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Canvas />
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { canvasSize, currentTool, layers, showLayerPanel, resetEvent, isTransparentUI } = storeToRefs(userStore);

const isCreatingNewCanvas = ref(true);
const width = ref(500);
const height = ref(500);

onMounted(() =>
  watch(
    currentTool,
    (newTool) => {
      document.body.style.cursor = getCursorStyle(newTool);
    },
    { immediate: true }
  )
);

onMounted(async () => {
  try {
    const clipboard = await navigator.clipboard.read();
    if (!clipboard.length) return;

    for (const item of clipboard) {
      if (!item.types.includes("image/png")) continue;

      const data = await item.getType("image/png");
      const image = new Image();
      image.src = URL.createObjectURL(data);
      await new Promise((resolve) => (image.onload = resolve));

      width.value = image.width;
      height.value = image.height;
    }
  } catch (error) {}
});

onMounted(() => window.addEventListener("keydown", createViaPaste));
onBeforeUnmount(() => window.removeEventListener("keydown", createViaPaste));
async function createViaPaste(e: KeyboardEvent) {
  if (!isCreatingNewCanvas.value) return;

  if ((e.ctrlKey || e.metaKey) && e.key == "v") {
    const clipboard = await navigator.clipboard.read();
    if (!clipboard.length) return;
    userStore.lastPastedImage = undefined;

    for (const item of clipboard) {
      if (!item.types.includes("image/png")) continue;

      userStore.lastPastedImage = item;
      const data = await item.getType("image/png");
      const image = new Image();
      image.src = URL.createObjectURL(data);
      await new Promise((resolve) => (image.onload = resolve));

      width.value = image.width;
      height.value = image.height;
      createNew(true);
      return;
    }
  }
}

async function createNew(confirm: boolean) {
  if (confirm) {
    const boundedWidth = Math.max(1, Math.min(9999, Math.floor(width.value)));
    const boundedHeight = Math.max(1, Math.min(9999, Math.floor(height.value)));
    canvasSize.value = [boundedWidth, boundedHeight];
    resetEvent.value = true;
  }

  isCreatingNewCanvas.value = false;
  width.value = canvasSize.value[0];
  height.value = canvasSize.value[1];
}

async function copyImage() {
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize.value[0];
  canvas.height = canvasSize.value[1];
  const context = canvas.getContext("2d");
  if (!context) return;

  for (const layer of layers.value) {
    if (!layer.isVisible || layer.opacity === 0) continue;

    const image = new Image();
    image.src = layer.dataUrl;
    await new Promise((resolve) => (image.onload = resolve));
    context.globalAlpha = layer.opacity / 100;
    context.drawImage(image, 0, 0);
  }

  navigator.clipboard.write([
    new ClipboardItem({
      "image/png": await new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!)))
    })
  ]);
}
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
