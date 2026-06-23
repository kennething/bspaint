<template>
  <div class="flex items-center justify-around gap-2">
    <GuiMenu class="flex items-center justify-center gap-0.5 rounded-full! px-0.5">
      <button
        v-for="tool in tools"
        :key="tool"
        @click="useSetTool(tool)"
        class="flex w-8 items-center justify-center rounded-full p-1"
        :class="activeTool === tool ? 'bg-neutral-200/90 hover:bg-neutral-300/75' : 'hover:bg-neutral-200/50'"
        :aria-label="`Use the ${tool} tool`"
      >
        <img class="size-5" :src="`/icons/${tool}.svg`" aria-hidden="true" />
      </button>
    </GuiMenu>
  </div>
</template>

<script setup lang="ts">
const toolStore = useToolStore();
const { activeTool } = storeToRefs(toolStore);

const tools = ["select", "brush", "text", "eyedropper"] as const satisfies Tool[];
</script>

<style scoped></style>
