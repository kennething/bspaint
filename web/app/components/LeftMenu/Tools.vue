<template>
  <GuiButtonGroup>
    <GuiInnerButton v-for="tool in tools" :key="tool" :image="`/icons/${tool}.svg`" :is-active="activeTool === tool" :label="`Use the ${tool} tool`" @clicked="useSetTool(tool)" />
  </GuiButtonGroup>
</template>

<script setup lang="ts">
const toolStore = useToolStore();
const { activeTool } = storeToRefs(toolStore);

const tools = ["select", "brush", "text", "eyedropper"] as const satisfies Tool[];
</script>

<style scoped></style>
