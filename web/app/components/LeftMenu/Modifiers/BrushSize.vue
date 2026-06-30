<template>
  <GuiSlider
    class="backdrop-blur-none!"
    :class="{ 'border-none!': !isMac }"
    v-model="model"
    name="Brush Size"
    :custom-button-tooltip="`Brush Size (${specialKeys.arrowup}/${specialKeys.arrowdown})`"
    button-tooltip-direction="right"
    image="/icons/droplet.svg"
    :min="config.public.minBrushSize"
    :max="config.public.maxBrushSize"
    is-skewed
    :tooltip-format="(value) => `${Math.round(value)}px`"
    @on-change="
      canvasStore.saveHistory();
      useUpdateBrush();
    "
  />
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const model = defineModel<number>();

const canvasStore = useCanvasStore();

const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);
</script>

<style scoped></style>
