<template>
  <div class="flex w-full cursor-auto items-center gap-6 bg-gray-100 px-4 py-2 transition-opacity duration-500 select-none *:select-none" :class="{ 'pointer-events-none': isTransparentUI }">
    <div class="flex items-center justify-center gap-2">
      <ToolbarButton :can-do-action="canUndo" :is-doing-action="!!isUndoing" @clicked="isUndoing = Symbol(0)" tooltip="Undo (Ctrl+Z)" icon="undo" />
      <ToolbarButton :can-do-action="canRedo" :is-doing-action="!!isRedoing" @clicked="isRedoing = Symbol(0)" tooltip="Redo (Ctrl+Y)" icon="redo" />
    </div>

    <div class="-mr-8 grid grid-cols-3 gap-2 lg:flex">
      <button
        v-for="tool in tools"
        :key="tool.type"
        @click="currentTool = tool.type"
        class="du-tooltip du-tooltip-bottom rounded-lg border bg-neutral-50 p-1"
        :class="currentTool === tool.type ? 'bg-neutral-900/90 text-white' : 'hover:bg-white'"
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
    </div>

    <ModifierBar></ModifierBar>

    <div class="relative flex items-center justify-center gap-1 text-center">
      <label class="flex flex-col items-center gap-1 rounded-md p-2 transition-colors hover:bg-white" for="fore">
        <input id="fore" type="color" class="size-10" v-model="currentColor.primary" tabindex="-1" />
        Color 1
      </label>
      <label class="flex flex-col items-center gap-1 rounded-md p-2 transition-colors hover:bg-white" for="back">
        <input id="back" type="color" class="size-10" v-model="currentColor.secondary" tabindex="-1" />
        Color 2
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentColor, currentTool, previousTool, tools, history, historyIndex, undoEvent, redoEvent, isTransparentUI, isInModiferBar } = storeToRefs(userStore);

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
  if (currentTool.value === "text" && tools.value.text.isTyping) return;
  if (isInModiferBar.value) return;

  const key = event.key.toLowerCase();

  if (key === "b") return void (currentTool.value = "brush");
  if (key === "f") return void (currentTool.value = "fill");
  if (key === "e") return void (currentTool.value = "eraser");
  if (key === "v") return void (currentTool.value = "select");
  if (key === "i") return void (currentTool.value = "eyedropper");
  if (key === "t") return void (currentTool.value = "text");
  if (key === " ") {
    const current = currentTool.value;
    currentTool.value = previousTool.value;
    previousTool.value = current;
    event.preventDefault();
    return;
  }

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

watch(currentTool, (newTool, oldTool) => {
  if (newTool === oldTool) return;
  previousTool.value = oldTool;
});

const layersEl = useTemplateRef("layers");
function hideLayers() {
  layersEl.value?.removeAttribute("open");
}
function layerToggle() {
  if (!layersEl.value) return;
  if (layersEl.value.hasAttribute("open")) window.addEventListener("mousedown", hideLayers);
  else window.removeEventListener("mousedown", hideLayers);
}
</script>

<style scoped></style>
