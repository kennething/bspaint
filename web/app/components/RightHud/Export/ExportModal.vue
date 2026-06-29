<template>
  <Teleport to="body">
    <GuiMenu do-transition class="fixed top-1/2 left-1/2 z-20 flex h-1/2 -translate-x-1/2 -translate-y-1/2 items-start justify-around gap-4 p-4 shadow-lg! shadow-neutral-400/50!" @click.stop>
      <img :src="canvasPreview" class="h-50 max-h-[50vh] max-w-[50vw] border border-neutral-400/50" :class="{ 'transparent-sprite-sm': options.format !== 'jpg' || !hasTransparency }" alt="Preview" />

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
              :class="
                !options.fileOrCopy || (options.fileOrCopy === 'copy' && ['jpg', 'webp'].includes(option))
                  ? 'cursor-not-allowed opacity-30'
                  : options.format === option
                    ? 'border-blue-100/90! bg-blue-100/70! hover:bg-blue-200/50!'
                    : 'hover:bg-neutral-200/35!'
              "
            >
              <button
                class="h-full w-full rounded-full py-2 text-xl font-light"
                :disabled="!options.fileOrCopy || (options.fileOrCopy === 'copy' && ['jpg', 'webp'].includes(option))"
                @click="options.format = option"
              >
                .{{ option.toUpperCase() }}
              </button>
            </GuiMenu>

            <GuiMenu v-if="options.format === 'jpg' && hasTransparency" class="flex items-center justify-center rounded-full! border-red-200/70! bg-red-100/50! px-6!">
              <img class="size-6" src="/icons/warning.svg" aria-hidden="true" />
              <p class="text-center">Background and layer transparency will be lost when converting to JPG</p>
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
// BUG: copy to clipboard doesnt work in tauri
const emit = defineEmits<{
  close: [void];
}>();

const canvasStore = useCanvasStore();
const { fabricCanvas: canvas } = storeToRefs(canvasStore);
const toolStore = useToolStore();
const userStore = useUserStore();

const canvasPreview = ref<string>();
const hasTransparency = computed(() => toolStore.backgroundColor.slice(7, 9) !== "FF" || canvasStore.layers.some((layer) => layer.opacity !== 100));

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
  () => options.fileOrCopy,
  (newVal) => {
    if (newVal === "copy" && options.format && ["jpg", "webp"].includes(options.format)) options.format = undefined;
  }
);
watch(
  () => options.fileName,
  (newVal) => {
    if (newVal?.endsWith(`.${options.format}`)) options.fileName = newVal.slice(0, -`.${options.format}`.length);
  }
);

const canSubmit = computed(() => !!options.fileOrCopy && !!options.format && ((options.fileOrCopy === "file" && !!options.fileName) || options.fileOrCopy === "copy"));
async function save() {
  if (!canSubmit.value) return console.warn("save no canSubmit");
  if (!canvas.value) return console.warn("save no fabricCanvas");

  if (options.format === "svg") {
    const svgString = await useCanvasToImage("svg");
    const svgFile = new File([svgString], `${options.fileOrCopy === "file" ? options.fileName : "image"}.svg`, { type: "image/svg+xml" });

    if (options.fileOrCopy === "copy") {
      await navigator.clipboard.write([new ClipboardItem({ [svgFile.type]: svgFile })]);
    } // copy
    else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(svgFile);
      link.download = svgFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } // file
  } // svg format
  else {
    if (options.fileOrCopy === "copy") {
      const blob = await useCanvasToImage(options.format!, true);
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } else {
      const url = await useCanvasToImage(options.format!);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${options.fileName}.${options.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } // file
  } // else

  emit("close");
}
</script>

<style scoped></style>
