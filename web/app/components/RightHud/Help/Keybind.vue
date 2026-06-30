<template>
  <div class="flex w-full items-center justify-between">
    <p>{{ keybind.action }}</p>

    <div class="flex items-center justify-center gap-1 select-none">
      <span v-for="modifier in keySet[0]" class="border border-neutral-400/50 px-2 py-1 text-sm font-light" :class="{ 'rounded-full': isMac }">{{
        modifierKeys[isMac ? "mac" : "windows"][modifier]
      }}</span>

      <span
        class="border border-neutral-400/50 px-2 py-1 text-sm font-light"
        :class="{ 'du-tooltip du-tooltip-left cursor-help': specialKey, 'rounded-full': isMac }"
        :data-tip="specialKey ? (keySet[1] === ' ' ? 'SPACE' : keySet[1].toUpperCase()) : undefined"
      >
        {{ specialKey ?? keySet[1].toUpperCase() }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  keybind: Keybind;
  isMac: boolean;
}>();

const keySet = computed(() => (props.isMac && "macKeys" in props.keybind ? props.keybind.macKeys! : props.keybind.keys));
// @ts-ignore-error
const specialKey = computed(() => (keySet.value[1] in specialKeys ? specialKeys[keySet.value[1]] : undefined));
</script>

<style scoped></style>
