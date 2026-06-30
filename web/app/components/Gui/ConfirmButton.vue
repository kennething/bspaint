<template>
  <GuiButtonSingle
    v-if="isMac"
    :class="{ 'border-blue-100/90! bg-blue-100/70! hover:border-blue-200/70!': !isDisabled }"
    image="/icons/check.svg"
    label="Confirm"
    :is-active="isActive"
    :is-disabled="isDisabled"
    :inner-class-override="!isDisabled ? 'hover:bg-blue-200/50!' : ''"
    @clicked="emit('clicked')"
  />

  <GuiMenu v-else class="transition duration-500" :class="isDisabled ? 'opacity-30' : 'border-2! border-blue-400!'">
    <button @click="emit('clicked')" :disabled="isDisabled" class="flex items-center justify-center bg-neutral-200 px-4 py-0 transition duration-500" :class="{ 'hover:bg-sky-100': !isDisabled }">
      <p class="mt-0.5 text-sm">OK</p>
    </button>
  </GuiMenu>
</template>

<script setup lang="ts">
const props = defineProps<{
  isActive?: boolean;
  isDisabled?: boolean;
}>();
const emit = defineEmits<{
  clicked: [void];
}>();

const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);
</script>

<style scoped></style>
