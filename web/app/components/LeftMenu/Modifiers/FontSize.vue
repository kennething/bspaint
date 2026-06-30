<template>
  <GuiSlider
    class="backdrop-blur-none!"
    :class="{ 'border-none!': !isMac }"
    v-model="model"
    name="Font Size"
    :custom-button-tooltip="`Font Size (${specialKeys.arrowup}/${specialKeys.arrowdown})`"
    button-tooltip-direction="right"
    image="/icons/text-size.svg"
    :min="config.public.minFontSize"
    :max="config.public.maxFontSize"
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
