<template>
  <GuiMenu class="flex w-full flex-col items-center justify-center gap-6 p-6">
    <div v-if="activeTool === 'brush'" class="flex flex-col items-center justify-center gap-2">
      <GuiSlider class="backdrop-blur-none!" v-model="brushSize" name="Brush size" image="/icons/droplet.svg" :min="1" :max="101" :step="5" @on-change="useUpdateBrush" />
    </div>

    <div v-else-if="activeTool === 'text'" class="flex flex-col items-center justify-center gap-2">
      <GuiSlider class="backdrop-blur-none!" v-model="fontSize" name="Font size" image="/icons/text-size.svg" :min="1" :max="101" />
      <GuiMenu class="flex items-center justify-center gap-2 rounded-full! px-1.5 backdrop-blur-none!">
        <img class="size-7 p-1" src="/icons/font.svg" aria-hidden="true" />
        <label for="font-family" class="sr-only">Font family</label>
        <select id="font-family" class="w-full appearance-none rounded-full outline-none" v-model="fontFamily">
          <option v-for="font in fonts" :value="font">{{ font }}</option>
        </select>
      </GuiMenu>
    </div>
  </GuiMenu>
</template>

<script setup lang="ts">
const toolStore = useToolStore();
const { activeTool, brushSize, fontFamily, fontSize } = storeToRefs(toolStore);
</script>

<style scoped></style>
