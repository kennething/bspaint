<template>
  <Teleport to="body">
    <div class="fixed bottom-0 left-0 z-10 flex items-center justify-center" :class="{ 'm-2 gap-2 rounded-full!': isMac }">
      <LeftHudZoom />
      <LeftHudPosition />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);
</script>

<style scoped></style>
