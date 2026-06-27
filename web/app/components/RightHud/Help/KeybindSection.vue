<template>
  <div class="flex flex-col items-center justify-center gap-4">
    <h3 class="text-lg font-bold">{{ title }}</h3>

    <RightHudHelpKeybind v-for="keybind in filteredKeybinds.toReversed()" :keybind="keybind" :is-mac="isMac" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  keybinds: Keybind[];
  isMac: boolean;
}>();

const filteredKeybinds: Keybind[] = [];
for (const keybind of props.keybinds) {
  if (filteredKeybinds.some((k) => k.action === keybind.action)) continue;
  filteredKeybinds.push(keybind);
}
</script>

<style scoped></style>
