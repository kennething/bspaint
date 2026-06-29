<template>
  <GuiMenu class="flex w-full flex-col items-center justify-center gap-6 p-6">
    <div class="flex w-full items-center" :class="singleColor ? 'justify-center' : 'justify-between'">
      <div
        role="button"
        @click="openColorPicker('primary')"
        :disabled="!!pickingColor"
        class="du-tooltip h-12 w-18 overflow-hidden rounded-xl border border-neutral-400/50"
        :class="{ 'transparent-sprite-sm': primaryCanTransparent }"
        :data-tip="`${primaryTooltip ? primaryTooltip : 'Primary'} Color`"
      >
        <div class="h-full w-full" :style="{ backgroundColor: primaryCanTransparent ? primaryColorModel : primaryColorModel?.slice(0, 7) }"></div>
      </div>

      <GuiMenu v-if="!singleColor" class="flex items-center justify-center rounded-full! px-0.5 backdrop-blur-none!">
        <button @click="swapColors" :disabled="!!pickingColor" class="du-tooltip w-full rounded-full px-2 py-1" data-tip="Swap Colors" :class="pickingColor ? 'opacity-30' : 'hover:bg-neutral-200/35'">
          <img class="size-5" src="/icons/swap.svg" aria-hidden="true" />
        </button>
      </GuiMenu>

      <div
        role="button"
        v-if="!singleColor"
        @click="openColorPicker('secondary')"
        :disabled="!!pickingColor"
        class="du-tooltip h-12 w-18 overflow-hidden rounded-xl border border-neutral-400/50"
        :class="{ 'transparent-sprite-sm': secondaryCanTransparent }"
        :data-tip="`${secondaryTooltip ? secondaryTooltip : 'Secondary'} Color`"
      >
        <div class="h-full w-full" :style="{ backgroundColor: secondaryCanTransparent ? secondaryColorModel : secondaryColorModel?.slice(0, 7) }"></div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-around gap-2" v-auto-animate>
      <div
        v-for="color in recentColors"
        :key="color"
        role="button"
        @click.left="primaryColorModel = color"
        @click.right.prevent="secondaryColorModel = color"
        class="size-7 overflow-hidden rounded-lg border border-neutral-300/50"
        :class="{ 'bg-neutral-200/50': color === '', 'transparent-sprite-xs': color !== '' && (primaryCanTransparent || secondaryCanTransparent) }"
        :disabled="!color"
      >
        <div class="h-full w-full" :style="{ backgroundColor: color === '' ? '' : primaryCanTransparent || secondaryCanTransparent ? color : color.slice(0, 7) }"></div>
      </div>
    </div>
  </GuiMenu>

  <ColorPicker v-if="pickingColor === 'primary'" v-model="primaryColorModel" :allow-transparency="primaryCanTransparent" @close="pickingColor = undefined" />
  <ColorPicker v-else-if="pickingColor === 'secondary'" v-model="secondaryColorModel" :allow-transparency="secondaryCanTransparent" @close="pickingColor = undefined" />
</template>

<script setup lang="ts">
const props = defineProps<{
  /** only show 1 color */
  singleColor?: boolean;
  /** tooltip for primary color, gets added to `${primaryTooltip} Color` */
  primaryTooltip?: string;
  primaryCanTransparent?: boolean;
  /** tooltip for secondary color, gets added to `${secondaryTooltip} Color` */
  secondaryTooltip?: string;
  secondaryCanTransparent?: boolean;
}>();

const primaryColorModel = defineModel<string>("primary");
const secondaryColorModel = defineModel<string>("secondary");

const toolStore = useToolStore();
const { recentColors } = storeToRefs(toolStore);

const pickingColor = ref<"primary" | "secondary">();

function openColorPicker(color: "primary" | "secondary") {
  if (pickingColor.value) return;
  console.log(primaryColorModel.value, secondaryColorModel.value);
  pickingColor.value = color;
}

function swapColors() {
  if (pickingColor.value) return;

  const temp = primaryColorModel.value;
  primaryColorModel.value = secondaryColorModel.value;
  secondaryColorModel.value = temp;
}
</script>

<style scoped></style>
