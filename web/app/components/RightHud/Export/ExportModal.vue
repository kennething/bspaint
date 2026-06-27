<template>
  <Teleport to="body">
    <GuiMenu do-transition class="fixed top-1/2 left-1/2 z-20 flex h-1/2 -translate-x-1/2 -translate-y-1/2 items-start justify-around gap-4 p-4 shadow-lg! shadow-neutral-400/50!" @click.stop>
      <img :src="canvasPreview" class="transparent-sprite-sm h-50 max-h-[50vh] max-w-[50vw] border border-neutral-400/50" alt="Preview" />

      <div class="flex h-full w-100 flex-col items-center justify-between gap-2">
        <div class="flex w-full flex-col items-center justify-start gap-8">
          <div class="flex w-full flex-col items-center justify-center gap-2">
            <GuiMenu
              v-for="option in fileOrCopyOptions"
              :key="option"
              class="flex w-full items-center justify-center rounded-full! backdrop-blur-none!"
              :class="options.fileOrCopy === option ? 'border-blue-100/90! bg-blue-100/70! hover:border-blue-200/70! hover:bg-blue-200/50!' : 'hover:bg-neutral-200/35!'"
            >
              <button class="h-full w-full rounded-full px-6 py-2 text-xl font-light" @click="options.fileOrCopy = option">
                {{ option === "file" ? "Save as file" : "Copy to clipboard" }}
              </button>
            </GuiMenu>
          </div>

          <div class="flex w-full flex-wrap items-center justify-around gap-2">
            <GuiMenu
              v-for="option in formatOptions"
              :key="option"
              class="flex w-1/3! grow items-center justify-center rounded-full! backdrop-blur-none!"
              :class="!options.fileOrCopy ? 'cursor-not-allowed opacity-30' : options.format === option ? 'border-blue-100/90! bg-blue-100/70! hover:bg-blue-200/50!' : 'hover:bg-neutral-200/35!'"
            >
              <button class="h-full w-full rounded-full py-2 text-xl font-light" :disabled="!options.fileOrCopy" @click="options.format = option">.{{ option.toUpperCase() }}</button>
            </GuiMenu>
          </div>

          <div class="flex w-full items-center justify-center gap-1 pr-4" v-if="options.fileOrCopy === 'file'">
            <label for="file-name" class="sr-only">File Name</label>
            <GuiMenu class="grow rounded-full! focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
              <input
                id="file-name"
                type="text"
                class="w-full py-2 text-center focus:outline-none"
                :class="{ 'cursor-not-allowed opacity-30': !options.format }"
                :disabled="!options.format"
                v-model="options.fileName"
                maxlength="200"
                placeholder="File Name"
                @focus="userStore.stopKeybinds"
                @blur="userStore.restartKeybinds"
              />
            </GuiMenu>
            <span class="shrink-0">.{{ options.format }}</span>
          </div>
        </div>

        <div class="flex w-full items-center justify-end gap-2">
          <GuiButtonSingle image="/icons/close.svg" label="Cancel" @clicked="emit('close')" />
          <GuiButtonSingle
            :class="{ 'border-blue-100/90! bg-blue-100/70! hover:border-blue-200/70!': canSubmit }"
            :inner-class-override="canSubmit ? 'hover:bg-blue-200/50!' : ''"
            image="/icons/check.svg"
            label="Confirm"
            :is-disabled="!canSubmit"
            @clicked="save"
          />
        </div>
      </div>
    </GuiMenu>
  </Teleport>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  close: [void];
}>();

const canvasStore = useCanvasStore();
const { fabricCanvas: canvas } = storeToRefs(canvasStore);

const userStore = useUserStore();

const canvasPreview = ref<string>();

onBeforeMount(async () => {
  if (!canvas.value) return console.warn("handleResize no fabricCanvas");
  canvasPreview.value = await useCanvasToImage("webp");
});

const fileOrCopyOptions = ["file", "copy"] as const;
const formatOptions = ["svg", "png", "jpg", "webp"] as const;
const options = reactive({
  fileOrCopy: undefined as (typeof fileOrCopyOptions)[number] | undefined,
  format: undefined as (typeof formatOptions)[number] | undefined,
  fileName: undefined as string | undefined
});
watch(
  () => options.fileName,
  (newVal) => {
    if (newVal?.endsWith(`.${options.format}`)) options.fileName = newVal.slice(0, -`.${options.format}`.length);
  }
);

const canSubmit = computed(() => !!options.fileOrCopy && !!options.format && ((options.fileOrCopy === "file" && !!options.fileName) || options.fileOrCopy === "copy"));
function save() {} // TODO: todo
</script>

<style scoped></style>
