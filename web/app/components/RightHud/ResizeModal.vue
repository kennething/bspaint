<template>
  <Teleport to="body">
    <GuiMenu do-transition class="fixed top-1/2 left-1/2 flex h-100 -translate-x-1/2 -translate-y-1/2 items-center justify-between gap-4 p-4 shadow-lg! shadow-neutral-400/50!" @click.stop>
      <!-- <img :src="svgPreview" alt="" /> -->
      <div v-html="svgPreview" class="h-100 w-100 *:h-100 *:w-100" aria-label="Image preview"></div>
    </GuiMenu>
  </Teleport>
</template>

<script setup lang="ts">
const canvasStore = useCanvasStore();
const { fabricCanvas: canvas, canvasSize } = storeToRefs(canvasStore);

const svgPreview = ref<string>();

onBeforeMount(async () => {
  if (!canvas.value) return console.warn("handleResize no fabricCanvas");

  svgPreview.value = await useCanvasToImage();
  // svgPreview.value = canvas.value.toDataURL({ format: "png", multiplier: 1, left: 0, top: 0, width: canvasSize.value.width, height: canvasSize.value.height });
  console.log(svgPreview.value);
});
</script>

<style scoped></style>
