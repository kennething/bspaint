<template>
  <Transition>
    <div v-show="showTransition" class="solid-ass" @click.right.prevent>
      <slot></slot>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// TODO: windows styles
const props = defineProps<{ doTransition?: boolean }>();
const showTransition = ref(!props.doTransition);

onMounted(() => (showTransition.value = true));
</script>

<style scoped>
@reference "../../assets/main.css";

.solid-ass {
  @apply border-sky-base/90 bg-sky-base/70 rounded-xl border-2 shadow shadow-neutral-200/60 backdrop-blur-md;
}

@keyframes expand {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  65% {
    transform: scale(1.05);
    opacity: 1;
  }
  75% {
    transform: scale(0.975);
  }
  90% {
    transform: scale(0.975);
  }
  100% {
    transform: scale(1);
  }
}

.v-enter-active {
  animation: expand 0.3s linear;
}

.v-leave-active {
  animation: expand 0.3s linear reverse;
}
</style>
