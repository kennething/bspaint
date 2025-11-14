<template>
  <div
    class="flex h-16 w-100 cursor-default items-center justify-between rounded-br-xl bg-white/75 pl-6 transition duration-500 select-none *:select-none"
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
      <label for="transparent-selection" class="text-xs text-neutral-700">Transparent Selection</label>
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

    <div v-else-if="currentTool === 'text'" class="flex grow items-center justify-start gap-4 px-6">
      <div class="du-tooltip du-tooltip-bottom flex flex-col items-start justify-center gap-1" :data-tip="tools.text.fontSize">
        <label for="stroke-size" class="text-xs text-neutral-700">Font Size</label>
        <input
          id="stroke-size"
          class="du-range du-range-xs text-blue-400 [--range-bg:cyan] [--range-fill:0] [--range-thumb:blue]"
          type="range"
          min="8"
          max="100"
          v-model="tools.text.fontSize"
          tabindex="-1"
        />
      </div>

      <div class="flex flex-col items-start justify-center gap-1">
        <label for="font-family" class="text-xs text-neutral-700">Font Family</label>
        <select class="du-select du-select-xs w-30 text-nowrap dark:text-neutral-200 dark:*:text-neutral-200" name="font-family" id="font-family" v-model="tools.text.fontFamily" tabindex="-1">
          <option
            class="text-lg"
            v-for="font in fonts"
            :key="font"
            :value="font"
            :style="{ fontFamily: `'${font}'` }"
            :selected="tools.text.fontFamily === font"
            :disabled="tools.text.fontFamily === font"
          >
            {{ font }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentTool, tools, isTransparentUI } = storeToRefs(userStore);
</script>

<style scoped></style>
