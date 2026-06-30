<template>
  <GuiButtonGroup :class="{ 'border-r-0! border-b-0!': !isMac }">
    <GuiInnerButton
      v-for="(tool, index) in tools"
      :key="tool"
      :image="`/icons/${tool}.svg`"
      :is-active="activeTool === tool"
      :label="tool[0]!.toUpperCase() + tool.slice(1)"
      :tooltip-direction="index === 0 ? 'right' : 'bottom'"
      @clicked="useSetTool(tool)"
    />
  </GuiButtonGroup>
</template>

<script setup lang="ts">
const toolStore = useToolStore();
const { activeTool } = storeToRefs(toolStore);

const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);

const tools = ["select", "brush", "text", "eyedropper", "shape"] as const satisfies Tool[];
</script>

<style scoped></style>
