<template>
  <GuiSlider
    class="backdrop-blur-none!"
    v-model="model"
    name="Brush Size"
    :custom-button-tooltip="`Brush Size (${specialKeys.arrowup}/${specialKeys.arrowdown})`"
    button-tooltip-direction="bottom"
    image="/icons/droplet.svg"
    :min="1"
    :max="400"
    is-skewed
    :tooltip-format="(value) => `${Math.round(value)}px`"
    @on-change="useUpdateBrush"
  />
</template>

<script setup lang="ts">
const model = defineModel<number>();
</script>

<style scoped></style>
