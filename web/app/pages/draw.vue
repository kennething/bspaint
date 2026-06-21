<template>
  <div class="flex flex-col items-center justify-center">
    <p>hi</p>

    <main class="canvas-wrapper" ref="canvas-wrapper">
      <canvas ref="canvas"></canvas>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Canvas } from "fabric";

const canvasRef = useTemplateRef("canvas");
const canvasWrapperRef = useTemplateRef("canvas-wrapper");
const fabricCanvas = markRaw(ref<Canvas>());

onMounted(() => {
  fabricCanvas.value = new Canvas(canvasRef.value ?? undefined, {
    width: 800,
    height: 600,
    backgroundColor: "#ffffff",
    selection: true,
    preserveObjectStacking: true
  });
});
</script>

<style scoped></style>
