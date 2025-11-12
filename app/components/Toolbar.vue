<template>
  <div
    class="h-[80dvh] w-30 bg-white/75 p-4 rounded-r-xl fixed z-10000 left-0 top-1/2 -translate-y-1/2"
  ></div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentColor } = storeToRefs(userStore);
</script>

<style scoped></style>
