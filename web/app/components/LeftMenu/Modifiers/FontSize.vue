<template>
  <GuiSlider
    class="backdrop-blur-none!"
    v-model="model"
    name="Font Size"
    :custom-button-tooltip="`Font Size (${specialKeys.arrowup}/${specialKeys.arrowdown})`"
    button-tooltip-direction="bottom"
    image="/icons/text-size.svg"
    :min="1"
    :max="400"
    is-skewed
    :tooltip-format="(value) => `${Math.round(value)}px`"
  />
</template>

<script setup lang="ts">
const model = defineModel<number>();
</script>

<style scoped></style>
