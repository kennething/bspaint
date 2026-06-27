<template>
  <GuiMenu class="flex items-center justify-center gap-2 rounded-full! px-1.5 backdrop-blur-none!">
    <div class="du-tooltip du-tooltip-bottom ml-1 size-7" data-tip="Font Family">
      <img class="h-full w-full" src="/icons/font.svg" aria-hidden="true" />
    </div>
    <label for="font-family" class="sr-only">Font family</label>
    <select id="font-family" class="w-full appearance-none rounded-full outline-none" v-model="model" :style="{ fontFamily: model }">
      <option v-for="font in fonts" :value="font">{{ font }}</option>
    </select>
  </GuiMenu>
</template>

<script setup lang="ts">
const model = defineModel<string>();
</script>

<style scoped></style>
