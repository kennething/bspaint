<template>
  <GuiButtonSingle v-if="isMac" image="/icons/close.svg" label="Cancel" @clicked="emit('clicked')" />

  <GuiMenu v-else class="transition duration-500 hover:border-blue-300!">
    <button @click="emit('clicked')" class="flex items-center justify-center bg-neutral-200 px-4 py-0 transition duration-500 hover:bg-sky-100">
      <p class="mt-0.5 text-sm">Cancel</p>
    </button>
  </GuiMenu>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  clicked: [void];
}>();

const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);
</script>

<style scoped></style>
