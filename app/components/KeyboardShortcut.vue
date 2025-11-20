<template>
  <div class="flex h-9 w-full items-center justify-between">
    <div class="flex flex-col items-start justify-center">
      <p class="font-medium">{{ shortcut.name }}</p>
      <p v-if="'note' in shortcut" class="text-xs text-neutral-500">{{ shortcut.note }}</p>
    </div>
    <div class="flex items-center justify-center gap-1">
      <div v-for="(key, jndex) in shortcut.keys" class="flex items-center justify-center gap-1">
        <kbd class="du-kbd du-kbd-lg">{{ key }}</kbd>
        <span v-if="jndex < shortcut.keys.length - 1">+</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ shortcut: GeneralShortcut }>();
</script>

<style scoped></style>
