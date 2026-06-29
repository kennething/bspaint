<template>
  <GuiMenu class="flex w-full flex-col items-center justify-center gap-6 p-6">
    <div class="flex w-full items-center" :class="singleColor ? 'justify-center' : 'justify-between'">
      <button
        @click="openColorPicker(singleColor ? 'other' : 'primary')"
        :disabled="!!pickingColor"
        class="du-tooltip h-12 w-18 rounded-xl border border-neutral-400/50"
        :data-tip="`${primaryTooltip ? primaryTooltip : 'Primary'} Color`"
        :style="{ backgroundColor: singleColor ? singleColorModel : primaryColor }"
      ></button>

      <GuiMenu v-if="!singleColor" class="flex items-center justify-center rounded-full! px-0.5 backdrop-blur-none!">
        <button @click="swapColors" :disabled="!!pickingColor" class="du-tooltip w-full rounded-full px-2 py-1" data-tip="Swap Colors" :class="pickingColor ? 'opacity-30' : 'hover:bg-neutral-200/35'">
          <img class="size-5" src="/icons/swap.svg" aria-hidden="true" />
        </button>
      </GuiMenu>

      <button
        v-if="!singleColor"
        @click="openColorPicker('secondary')"
        :disabled="!!pickingColor"
        class="du-tooltip h-12 w-18 rounded-xl border border-neutral-400/50"
        :data-tip="`${secondaryTooltip ? secondaryTooltip : 'Secondary'} Color`"
        :style="{ backgroundColor: secondaryColor }"
      ></button>
    </div>

    <div class="flex flex-wrap items-center justify-around gap-2" v-auto-animate>
      <button
        v-for="color in recentColors"
        :key="color"
        @click.left="singleColor ? (singleColorModel = color) : toolStore.setColor('primary', color)"
        @click.right.prevent="toolStore.setColor('secondary', color)"
        class="size-7 rounded-lg border border-neutral-300/50"
        :class="{ 'bg-neutral-200/50': color === '' }"
        :disabled="!color"
        :style="{ backgroundColor: color === '' ? '' : color }"
      ></button>
    </div>
  </GuiMenu>

  <ColorPicker v-if="pickingColor" v-model="singleColorModel" :editing-color="pickingColor" @close="pickingColor = undefined" />
</template>

<script setup lang="ts">
const props = defineProps<{
  /** show only 1 color (if true, use v-model to model the hex code) */
  singleColor?: boolean;
  /** tooltip for primary color */
  primaryTooltip?: string;
  /** tooltip for secondary color */
  secondaryTooltip?: string;
}>();

const singleColorModel = defineModel<string>();

const toolStore = useToolStore();
const { primaryColor, secondaryColor, recentColors } = storeToRefs(toolStore);

const pickingColor = ref<"primary" | "secondary" | "other">();

function openColorPicker(color: "primary" | "secondary" | "other") {
  if (pickingColor.value) return;
  pickingColor.value = color;
}

function swapColors() {
  if (pickingColor.value) return;

  const temp = primaryColor.value;
  primaryColor.value = secondaryColor.value;
  secondaryColor.value = temp;
}
</script>

<style scoped></style>
