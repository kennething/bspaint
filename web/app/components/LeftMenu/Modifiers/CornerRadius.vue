<template>
  <GuiSlider
    class="backdrop-blur-none!"
    :class="{ 'border-none!': !isMac }"
    v-model="model"
    name="Corner Radius"
    button-tooltip-direction="right"
    image="/icons/angle.svg"
    :min="config.public.minCornerRadius"
    :max="config.public.maxCornerRadius"
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
