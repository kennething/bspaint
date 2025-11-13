<template>
  <div class="fixed top-1/2 left-0 z-10000 flex h-[80dvh] w-30 -translate-y-1/2 cursor-auto flex-col items-center justify-center rounded-r-xl bg-white/75 p-4 select-none *:select-none">
    <button @click="currentTool = 'brush'" tabindex="-1">brush</button>
    <button @click="currentTool = 'fill'" tabindex="-1">fill</button>
    <button @click="currentTool = 'eraser'" tabindex="-1">eraser</button>
    <button @click="currentTool = 'select'" tabindex="-1">select</button>
    <button @click="currentTool = 'eyedropper'" tabindex="-1">eyedropper</button>
    <input type="color" v-model="currentColor.primary" tabindex="-1" />
    <input type="color" v-model="currentColor.secondary" tabindex="-1" />
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentColor, currentTool } = storeToRefs(userStore);
</script>

<style scoped></style>
