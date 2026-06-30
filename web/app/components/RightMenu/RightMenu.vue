<template>
  <Teleport to="body">
    <div class="fixed top-0 right-0 z-10 flex w-72 flex-col items-center justify-center" :class="{ 'm-2 gap-2 rounded-t-3xl rounded-b-xl': isMac }">
      <RightMenuLayerInteractions class="z-11" />
      <RightMenuLayers />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);
</script>

<style scoped></style>
