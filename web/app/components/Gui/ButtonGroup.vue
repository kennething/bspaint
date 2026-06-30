<template>
  <GuiMenu class="flex items-center justify-center gap-0.5" :class="{ 'rounded-full! px-0.5': isMac }">
    <slot></slot>
  </GuiMenu>
</template>

<script setup lang="ts">
// ! add <GuiInnerButton />s inside this component to make a button group

const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);
</script>

<style scoped></style>
