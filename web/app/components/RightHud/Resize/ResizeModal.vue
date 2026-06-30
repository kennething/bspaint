<template>
  <Teleport to="body">
    <GuiMenu do-transition class="fixed top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 p-10 shadow-lg! shadow-neutral-400/50!" @click.stop>
      <GuiInput name="Width" v-model="newSize.width" model-type="number" @on-change="validateDimensions" :min="config.public.minCanvasSize" :max="config.public.maxCanvasSize" />
      <GuiInput name="Height" v-model="newSize.height" model-type="number" @on-change="validateDimensions" :min="config.public.minCanvasSize" :max="config.public.maxCanvasSize" />

      <div class="mt-4 flex w-full items-center justify-around gap-2">
        <GuiCancelButton @clicked="emit('close')" />
        <GuiConfirmButton @clicked="save" />
      </div>
    </GuiMenu>
  </Teleport>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  close: [void];
}>();

const canvasStore = useCanvasStore();
const { fabricCanvas: canvas, canvasSize } = storeToRefs(canvasStore);
const config = useRuntimeConfig();

const newSize = reactive({
  width: canvasSize.value.width,
  height: canvasSize.value.height
});

function validateDimensions() {
  if (newSize.width < config.public.minCanvasSize) newSize.width = config.public.minCanvasSize;
  if (newSize.height < config.public.minCanvasSize) newSize.height = config.public.minCanvasSize;
  if (newSize.width > config.public.maxCanvasSize) newSize.width = config.public.maxCanvasSize;
  if (newSize.height > config.public.maxCanvasSize) newSize.height = config.public.maxCanvasSize;
}

async function save() {
  if (!canvas.value) return console.warn("save no fabricCanvas");
  if (newSize.width < config.public.minCanvasSize || newSize.height < config.public.minCanvasSize || newSize.width > config.public.maxCanvasSize || newSize.height > config.public.maxCanvasSize)
    return console.warn(`save canvas size out of bounds`);

  canvasSize.value.width = newSize.width;
  canvasSize.value.height = newSize.height;
  useRedrawBoundingRect();

  canvasStore.saveHistory("all");
  emit("close");
}
</script>

<style scoped></style>
