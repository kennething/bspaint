<template>
  <div class="flex h-full min-h-dvh w-full min-w-dvw items-start justify-start p-60">
    <Toolbar />

    <Canvas />
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentTool } = storeToRefs(userStore);

onMounted(() =>
  watch(
    currentTool,
    (newTool) => {
      document.body.style.cursor = getCursorStyle(newTool);
    },
    { immediate: true }
  )
);
</script>

<style scoped></style>
