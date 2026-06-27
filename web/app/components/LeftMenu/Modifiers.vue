<template>
  <GuiMenu class="flex w-full flex-col items-center justify-center gap-6 p-6">
    <div v-if="activeTool === 'brush'" class="flex flex-col items-center justify-center gap-2">
      <GuiSlider
        class="backdrop-blur-none!"
        v-model="brushSize"
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
    </div>

    <div v-else-if="activeTool === 'text'" class="flex flex-col items-center justify-center gap-2">
      <GuiSlider
        class="backdrop-blur-none!"
        v-model="fontSize"
        name="Font Size"
        :custom-button-tooltip="`Font Size (${specialKeys.arrowup}/${specialKeys.arrowdown})`"
        button-tooltip-direction="bottom"
        image="/icons/text-size.svg"
        :min="1"
        :max="400"
        is-skewed
        :tooltip-format="(value) => `${Math.round(value)}px`"
      />
      <GuiMenu class="flex items-center justify-center gap-2 rounded-full! px-1.5 backdrop-blur-none!">
        <div class="du-tooltip du-tooltip-bottom ml-1 size-7" data-tip="Font Family">
          <img class="h-full w-full" src="/icons/font.svg" aria-hidden="true" />
        </div>
        <label for="font-family" class="sr-only">Font family</label>
        <select id="font-family" class="w-full appearance-none rounded-full outline-none" v-model="fontFamily" :style="{ fontFamily }">
          <option v-for="font in fonts" :value="font">{{ font }}</option>
        </select>
      </GuiMenu>
    </div>
  </GuiMenu>
</template>

<script setup lang="ts">
// TODO: change properties of selected objects
const toolStore = useToolStore();
const { activeTool, brushSize, fontFamily, fontSize } = storeToRefs(toolStore);
</script>

<style scoped></style>
