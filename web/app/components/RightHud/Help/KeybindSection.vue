<template>
  <div class="flex flex-col items-center justify-center gap-4">
    <h3 class="text-lg font-bold">{{ title }}</h3>

    <RightHudHelpKeybind v-for="keybind in keybinds" :keybind="keybind" :is-mac="isMac" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  keybinds: Keybind[];
  isMac: boolean;
}>();
</script>

<style scoped></style>
