<!-- single -->

<template>
  <div class="flex flex-col items-center justify-center">
    <NuxtLink to="/draw">a9gousa</NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: () => navigateTo("/draw")
});
</script>

<style scoped></style>
