<template>
  <Teleport to="body">
    <GuiMenu do-transition class="fixed top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 p-10 shadow-lg! shadow-neutral-400/50!" @click.stop>
      <div class="flex items-center justify-center gap-2">
        <label for="width" class="text-xs font-light">Width</label>
        <GuiMenu class="focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
          <input
            id="width"
            type="number"
            class="w-20 text-center focus:outline-none"
            v-model.number="newSize.width"
            :min="config.public.minCanvasSize"
            :max="config.public.maxCanvasSize"
            @change="validateDimensions"
            @focus="userStore.stopKeybinds"
            @blur="userStore.restartKeybinds"
          />
        </GuiMenu>
      </div>
      <div class="flex items-center justify-center gap-2">
        <label for="height" class="text-xs font-light">Height</label>
        <GuiMenu class="focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
          <input
            id="height"
            type="number"
            class="w-20 text-center focus:outline-none"
            v-model.number="newSize.height"
            :min="config.public.minCanvasSize"
            :max="config.public.maxCanvasSize"
            @change="validateDimensions"
            @focus="userStore.stopKeybinds"
            @blur="userStore.restartKeybinds"
          />
        </GuiMenu>
      </div>

      <div class="mt-4 flex w-full items-center justify-around">
        <GuiButtonSingle image="/icons/close.svg" label="Cancel" @clicked="emit('close')" />
        <GuiButtonSingle class="border-blue-100/90! bg-blue-100/70! hover:border-blue-200/70!" inner-class-override="hover:bg-blue-200/50!" image="/icons/check.svg" label="Confirm" @clicked="save" />
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

const userStore = useUserStore();

const newSize = reactive({
  width: canvasSize.value.width,
  height: canvasSize.value.height
});

function validateDimensions() {
  if (newSize.width < config.public.minCanvasSize) newSize.width = config.public.minCanvasSize;
  if (newSize.height < config.public.minCanvasSize) newSize.height = config.public.maxCanvasSize;
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
