<template>
  <div class="liquid-ass">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
@reference "../../assets/main.css";

.liquid-ass {
  @apply border-sky-base/90 bg-sky-base/60 rounded-xl border-2 shadow shadow-neutral-200/60 backdrop-blur-xs;
}
</style>
