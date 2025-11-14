<template>
  <div class="flex h-full min-h-dvh w-full min-w-dvw items-start justify-start p-60">
    <Teleport to="body">
      <Toolbar class="fixed top-1/2 left-0 z-100" />

      <Transition>
        <ModifierBar v-if="['select', 'brush', 'eraser'].includes(currentTool)" class="fixed top-0 left-0 z-100" />
      </Transition>

      <button
        class="fixed bottom-0 left-0 rounded-tr-xl bg-red-200/75 px-6 py-2 font-bold transition hover:bg-red-200"
        :class="{ 'pointer-events-none opacity-25': isTransparentUI }"
        @click="isCreatingNewCanvas = !isCreatingNewCanvas"
      >
        New Canvas
      </button>

      <Transition>
        <div
          class="fixed top-1/2 left-1/2 z-110 flex w-96 -translate-x-1/2 -translate-y-1/2 cursor-default flex-col items-center justify-center rounded-xl border-2 bg-white p-6 shadow-2xl"
          v-show="isCreatingNewCanvas"
        >
          <h3 class="text-2xl font-semibold">Create New Canvas</h3>
          <p class="text-center text-xs font-thin text-neutral-400">Your current canvas will die and will not be saved due to the rookie mistake of not having health insurance.</p>

          <div class="mt-6 flex grow items-center justify-center gap-2">
            <label for="width" class="shrink-0 text-sm font-medium">Width (px)</label>
            <input id="width" class="du-input du-input-sm grow dark:text-neutral-200" type="number" v-model="width" />
          </div>
          <div class="mt-2 flex grow items-center justify-center gap-2">
            <label for="height" class="shrink-0 text-sm font-medium">Height (px)</label>
            <input id="height" class="du-input du-input-sm grow dark:text-neutral-200" type="number" v-model="height" />
          </div>

          <div class="mt-6 flex w-full items-center justify-between gap-2">
            <button class="grow rounded-xl border-2 border-neutral-200 bg-neutral-200 py-2 text-lg font-semibold transition hover:border-neutral-300 hover:bg-neutral-300">Create</button>
            <button class="grow rounded-xl border-2 border-neutral-200 py-2 text-lg font-semibold transition hover:bg-neutral-200" @click="isCreatingNewCanvas = false">Wait No</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Canvas />
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentTool, isTransparentUI } = storeToRefs(userStore);

const isCreatingNewCanvas = ref(false);
const width = ref(1920);
const height = ref(1080);

onMounted(() =>
  watch(
    currentTool,
    (newTool) => {
      document.body.style.cursor = getCursorStyle(newTool);
    },
    { immediate: true }
  )
);
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
