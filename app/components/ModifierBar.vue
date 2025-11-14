<template>
  <div
    class="flex h-16 w-80 cursor-default items-center justify-between rounded-br-xl bg-white/75 pl-6 transition duration-500 select-none *:select-none"
    :class="{ 'pointer-events-none opacity-25': isTransparentUI }"
  >
    <img class="size-12" :src="currentTool === 'select' ? `/icons/select${tools.select.isTransparent ? '' : '-off'}.svg` : `/icons/${currentTool}.svg`" aria-hidden="true" />

    <div v-if="currentTool === 'brush' || currentTool === 'eraser'" class="flex grow px-6">
      <div class="du-tooltip du-tooltip-bottom flex flex-col items-start justify-center gap-1" :data-tip="tools[currentTool].radius">
        <label for="stroke-size" class="text-xs text-neutral-700 capitalize">{{ currentTool }} Size</label>
        <input
          id="stroke-size"
          class="du-range du-range-xs text-blue-400 [--range-bg:cyan] [--range-fill:0] [--range-thumb:blue]"
          type="range"
          min="1"
          max="100"
          v-model="tools[currentTool].radius"
          tabindex="-1"
        />
      </div>
    </div>

    <div v-else-if="currentTool === 'select'" class="flex grow flex-col items-start justify-center px-6">
      <label for="transparent-selection" class="text-xs text-neutral-700 capitalize">Transparent Selection</label>
      <div class="du-tooltip du-tooltip-bottom" :data-tip="tools.select.isTransparent ? 'Transparent' : 'Opaque'">
        <input
          id="transparent-selection"
          class="du-toggle du-toggle-sm border-blue-300 bg-blue-200 checked:border-blue-400 checked:bg-blue-300 checked:text-blue-100"
          type="checkbox"
          :disabled="tools.select.selectState !== 'idle'"
          v-model="tools.select.isTransparent"
          tabindex="-1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentTool, tools, isTransparentUI } = storeToRefs(userStore);
</script>

<style scoped></style>
