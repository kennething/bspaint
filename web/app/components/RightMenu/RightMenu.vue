<template>
  <Teleport to="body">
    <div class="fixed top-0 right-0 z-10 m-2 flex w-72 flex-col items-center justify-center gap-2 rounded-t-3xl rounded-b-xl">
      <RightMenuLayerInteractions class="z-11" />
      <RightMenuLayers />
    </div>
  </Teleport>
</template>

<script setup lang="ts"></script>

<style scoped></style>
