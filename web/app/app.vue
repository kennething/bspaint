<template>
  <NuxtPage />

  <input class="fixed top-1/2 left-1/2 z-100 -translate-x-1/2 -translate-y-1/2" type="file" @change="test" />
</template>

<script setup lang="ts">
async function test(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return console.warn("suijhgiuajsdg");

  const form = new FormData();
  form.append("file", file);

  const json = await $fetch("/api/uncompressFile", {
    method: "POST",
    body: form
  });
  console.log(json);
}
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
