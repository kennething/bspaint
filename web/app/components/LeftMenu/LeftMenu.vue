<template>
  <Teleport to="body">
    <div class="fixed top-0 left-0 z-10 flex w-64 flex-col items-center justify-center" :class="{ 'm-2 gap-2 rounded-xl': isMac }">
      <div class="z-11 flex w-full items-center justify-between" :class="[isMac ? 'gap-2' : 'bg-sky-base', { 'border-b border-b-neutral-300': !isMac && activeTool !== 'eyedropper' }]">
        <LeftMenuTools />
        <LeftMenuHistory />
      </div>
      <LeftMenuModifiers />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const toolStore = useToolStore();
const { activeTool } = storeToRefs(toolStore);

const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);
</script>

<style scoped></style>
