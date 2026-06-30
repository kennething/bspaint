<template>
  <GuiMenu class="flex items-center justify-center backdrop-blur-none!" :class="isMac ? 'gap-2 px-1.5' : 'w-50! gap-4 rounded-full! border-none! pl-4'">
    <div class="du-tooltip du-tooltip-right ml-1 size-7" data-tip="Font Family">
      <img class="h-full w-full" src="/icons/font.svg" aria-hidden="true" />
    </div>
    <label for="font-family" class="sr-only">Font family</label>
    <select id="font-family" class="w-full appearance-none rounded-full outline-none" v-model="model" :style="{ fontFamily: model }" @change="() => canvasStore.saveHistory()">
      <option v-for="font in fonts" :value="font" :style="{ fontFamily: font }">{{ font }}</option>
    </select>
  </GuiMenu>
</template>

<script setup lang="ts">
const model = defineModel<string>();

const canvasStore = useCanvasStore();

const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);
</script>

<style scoped></style>
