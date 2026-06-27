<template>
  <GuiMenu class="flex w-full flex-col items-center justify-center gap-6 p-6">
    <div v-if="activeTool === 'brush'" class="flex flex-col items-center justify-center gap-2">
      <LeftMenuModifiersBrushSize v-model="brushSize" />
    </div>

    <div v-else-if="activeTool === 'text'" class="flex flex-col items-center justify-center gap-2">
      <LeftMenuModifiersFontSize v-model="fontSize" />
      <LeftMenuModifiersFontFamily v-model="fontFamily" />
    </div>
  </GuiMenu>
</template>

<script setup lang="ts">
// TODO: change properties of selected objects
const toolStore = useToolStore();
const { activeTool, brushSize, fontFamily, fontSize } = storeToRefs(toolStore);

watch(brushSize, () => useBrushPreview());
watch(fontSize, () => useTextPreview());
</script>

<style scoped></style>
