<template>
  <div class="fixed top-1/2 left-0 z-10000 flex h-[80dvh] w-30 -translate-y-1/2 cursor-auto flex-col items-center justify-center rounded-r-xl bg-white/75 p-4">
    <button @click="currentTool = 'brush'">brush</button>
    <button @click="currentTool = 'fill'">fill</button>
    <button @click="currentTool = 'eraser'">eraser</button>
    <button @click="currentTool = 'select'">select</button>
    <input type="color" v-model="currentColor.primary" />
    <input type="color" v-model="currentColor.secondary" />
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentColor, currentTool } = storeToRefs(userStore);
</script>

<style scoped></style>
