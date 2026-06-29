<template>
  <GuiSlider
    class="backdrop-blur-none!"
    v-model="model"
    name="Corner Radius"
    button-tooltip-direction="right"
    image="/icons/angle.svg"
    :min="config.public.minCornerRadius"
    :max="config.public.maxCornerRadius"
    is-skewed
    :tooltip-format="(value) => `${Math.round(value)}px`"
  />
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const model = defineModel<number>();
</script>

<style scoped></style>
