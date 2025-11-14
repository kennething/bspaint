<template>
  <div
    class="flex w-30 -translate-y-1/2 cursor-auto flex-col items-center justify-center gap-2 rounded-r-xl bg-white/75 p-4 pt-10 pb-12 transition-opacity duration-500 select-none *:select-none"
    :class="{ 'pointer-events-none opacity-25': isTransparentUI }"
  >
    <div class="du-tooltip mb-2" :data-tip="`Zoom: ${canvasScale}x`">
      <label for="canvas-scale" class="sr-only">Zoom Level</label>
      <input
        id="canvas-scale"
        class="du-range du-range-xs text-blue-400 [--range-bg:cyan] [--range-fill:0] [--range-thumb:blue]"
        type="range"
        min="0.25"
        max="8"
        step="0.25"
        v-model="canvasScale"
        tabindex="-1"
      />
    </div>

    <div class="mb-2 flex items-center justify-center gap-2">
      <ToolbarButton :can-do-action="canUndo" :is-doing-action="!!isUndoing" @clicked="isUndoing = Symbol(0)" tooltip="Undo (Ctrl+Z)" icon="undo" />
      <ToolbarButton :can-do-action="canRedo" :is-doing-action="!!isRedoing" @clicked="isRedoing = Symbol(0)" tooltip="Redo (Ctrl+Y)" icon="redo" />
    </div>

    <button
      v-for="tool in tools"
      :key="tool.type"
      @click="currentTool = tool.type"
      class="du-tooltip du-tooltip-right rounded-lg border p-2"
      :class="currentTool === tool.type ? 'bg-neutral-900/90' : 'hover:bg-neutral-200/50'"
      :data-tip="`${tool.type[0]?.toUpperCase() + tool.type.slice(1)} (${tool.shortcut.toUpperCase()})`"
      tabindex="-1"
    >
      <img
        class="size-8"
        :class="{ invert: currentTool === tool.type }"
        :src="tool.type === 'select' ? `/icons/select${tool.isTransparent ? '' : '-off'}.svg` : `/icons/${tool.type}.svg`"
        :alt="tool.type"
      />
    </button>

    <div class="mt-2 flex translate-x-2.5 items-center justify-center">
      <input type="color" class="size-10 cursor-pointer" v-model="currentColor.primary" tabindex="-1" />
      <input type="color" class="size-10 -translate-x-1/2 translate-y-1/2 cursor-pointer" v-model="currentColor.secondary" tabindex="-1" />
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentColor, currentTool, tools, history, historyIndex, undoEvent, redoEvent, isTransparentUI, canvasScale } = storeToRefs(userStore);

const canUndo = computed(() => history.value.length > 0 && historyIndex.value > 0);
const canRedo = computed(() => history.value.length > 0 && historyIndex.value < history.value.length - 1);

const isUndoing = ref<symbol>();
watch(isUndoing, (newVal) => {
  if (newVal) undoEvent.value = true;
  setTimeout(() => (isUndoing.value = undefined), 100);
});
const isRedoing = ref<symbol>();
watch(isRedoing, (newVal) => {
  if (newVal) redoEvent.value = true;
  setTimeout(() => (isRedoing.value = undefined), 100);
});

function handleKeybinds(event: KeyboardEvent): void {
  const key = event.key.toLowerCase();

  if (key === "b") return void (currentTool.value = "brush");
  if (key === "f") return void (currentTool.value = "fill");
  if (key === "e") return void (currentTool.value = "eraser");
  if (key === "v") return void (currentTool.value = "select");
  if (key === "i") return void (currentTool.value = "eyedropper");

  if (event.ctrlKey || event.metaKey) {
    if ((event.shiftKey && key === "z") || key === "y") {
      if (canRedo.value) isRedoing.value = Symbol(0);
      return event.preventDefault();
    }
    if (key === "z") {
      if (canUndo.value) isUndoing.value = Symbol(0);
      return event.preventDefault();
    }
  }
}
onMounted(() => window.addEventListener("keydown", handleKeybinds));
onUnmounted(() => window.removeEventListener("keydown", handleKeybinds));
</script>

<style scoped></style>
