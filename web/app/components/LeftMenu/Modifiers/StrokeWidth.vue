<template>
  <GuiSlider
    class="backdrop-blur-none!"
    :class="{ 'border-none!': !isMac }"
    v-model="model"
    name="Stroke Width"
    :custom-button-tooltip="`Stroke Width (${specialKeys.arrowup}/${specialKeys.arrowdown})`"
    button-tooltip-direction="right"
    image="/icons/stroke-width.svg"
    :min="config.public.minStrokeWidth"
    :max="config.public.maxStrokeWidth"
    is-skewed
    :tooltip-format="(value) => `${Math.round(value)}px`"
    @on-change="() => canvasStore.saveHistory()"
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
