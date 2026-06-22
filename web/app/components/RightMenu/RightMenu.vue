<template>
  <Teleport to="body">
    <div class="fixed top-0 right-0 z-10 m-2 flex h-[calc(100vh-1rem)] w-80 flex-col items-center justify-between gap-2">
      <RightMenuLayerInteractions />
      <RightMenuLayers />
    </div>
  </Teleport>
</template>

<script setup lang="ts"></script>

<style scoped></style>
