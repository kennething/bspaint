<template>
  <div class="flex h-full min-h-dvh w-full min-w-dvw items-start justify-start p-60">
    <Toolbar />

    <Canvas />
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentTool } = storeToRefs(userStore);

function getCursorStyle(tool: ToolType) {
  if (tool === "brush") return "cell";
  if (tool === "eraser") return "grab";
  if (tool === "fill") return "copy";
  if (tool === "select") return "crosshair";
  if (tool === "eyedropper") return "context-menu";
  return "default";
}

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
