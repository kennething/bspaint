<template>
  <GuiSlider
    class="backdrop-blur-none!"
    v-model="model"
    name="Stroke Width"
    :custom-button-tooltip="`Stroke Width (${specialKeys.arrowup}/${specialKeys.arrowdown})`"
    button-tooltip-direction="right"
    image="/icons/stroke-width.svg"
    :min="config.public.minStrokeWidth"
    :max="config.public.maxStrokeWidth"
    is-skewed
    :tooltip-format="(value) => `${Math.round(value)}px`"
  />
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const model = defineModel<number>();
</script>

<style scoped></style>
