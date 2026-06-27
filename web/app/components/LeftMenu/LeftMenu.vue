<template>
  <Teleport to="body">
    <div class="fixed top-0 left-0 z-10 m-2 flex w-64 flex-col items-center justify-center gap-2 rounded-xl">
      <div class="z-11 flex w-full items-center justify-around gap-2">
        <LeftMenuTools />
        <LeftMenuHistory />
      </div>
      <LeftMenuModifiers />
    </div>
  </Teleport>
</template>

<script setup lang="ts"></script>

<style scoped></style>
