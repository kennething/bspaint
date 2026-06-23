<template>
  <div class="flex items-center justify-around gap-2">
    <GuiMenu class="flex items-center justify-center gap-0.5 rounded-full! px-0.5">
      <button
        @click="canvasStore.changeHistory('undo')"
        class="flex w-8 items-center justify-center rounded-full p-1"
        :class="canUndo ? 'hover:bg-neutral-200/50' : 'opacity-30'"
        :disabled="!canUndo"
        aria-label="Undo the last action"
      >
        <img class="size-5" src="/icons/undo.svg" aria-hidden="true" />
      </button>
      <button
        @click="canvasStore.changeHistory('redo')"
        class="flex w-8 items-center justify-center rounded-full p-1"
        :class="canRedo ? 'hover:bg-neutral-200/50' : 'opacity-30'"
        :disabled="!canRedo"
        aria-label="Redo the last action"
      >
        <img class="size-5" src="/icons/redo.svg" aria-hidden="true" />
      </button>
    </GuiMenu>
  </div>
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { canUndo, canRedo } = storeToRefs(canvasStore);
</script>

<style scoped></style>
