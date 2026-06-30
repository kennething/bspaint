<template>
  <GuiMenu class="flex w-full flex-col items-center justify-center" :class="isMac ? 'gap-6 p-6' : 'gap-2 px-6 py-2'">
    <div class="flex w-full items-center" :class="singleColor ? 'justify-center' : 'justify-between'">
      <div class="du-tooltip" :data-tip="`${primaryTooltip ? primaryTooltip : 'Primary'} Color`">
        <div
          role="button"
          @click="openColorPicker('primary')"
          :disabled="!!pickingColor"
          class="h-12 w-18 overflow-hidden border"
          :class="[{ 'transparent-sprite-sm': primaryCanTransparent, 'cursor-not-allowed! active:scale-100!': pickingColor }, isMac ? 'rounded-xl border-neutral-400/50' : 'border-neutral-400']"
        >
          <div class="h-full w-full" :style="{ backgroundColor: primaryCanTransparent ? primaryColorModel : primaryColorModel?.slice(0, 7) }"></div>
        </div>
      </div>

      <GuiMenu v-if="!singleColor" class="flex items-center justify-center" :class="isMac ? 'rounded-full! px-0.5 backdrop-blur-none!' : 'border-none!'">
        <button
          @click="swapColors"
          :disabled="!!pickingColor"
          class="du-tooltip w-full rounded-full px-2 py-1"
          data-tip="Swap Colors"
          :class="[{ 'cursor-not-allowed! active:scale-100!': pickingColor }, pickingColor ? 'opacity-30' : isMac ? 'hover:bg-neutral-200/35' : '']"
        >
          <img class="size-5" src="/icons/swap.svg" aria-hidden="true" />
        </button>
      </GuiMenu>

      <div class="du-tooltip" :data-tip="`${secondaryTooltip ? secondaryTooltip : 'Secondary'} Color`">
        <div
          role="button"
          v-if="!singleColor"
          @click="openColorPicker('secondary')"
          :disabled="!!pickingColor"
          class="h-12 w-18 overflow-hidden border"
          :class="[{ 'transparent-sprite-sm': secondaryCanTransparent, 'cursor-not-allowed! active:scale-100!': pickingColor }, isMac ? 'rounded-xl border-neutral-400/50' : 'border-neutral-400']"
        >
          <div class="h-full w-full" :style="{ backgroundColor: secondaryCanTransparent ? secondaryColorModel : secondaryColorModel?.slice(0, 7) }"></div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-around gap-2" v-auto-animate>
      <div
        v-for="color in recentColors"
        :key="color"
        role="button"
        @click.left="primaryColorModel = color"
        @click.right.prevent="secondaryColorModel = color"
        class="size-7 overflow-hidden border"
        :class="[
          { 'cursor-not-allowed! active:scale-100!': !color, 'bg-neutral-200/50': color === '', 'transparent-sprite-xs': color !== '' && (primaryCanTransparent || secondaryCanTransparent) },
          isMac ? 'rounded-lg border-neutral-300/50' : 'border-neutral-300'
        ]"
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
const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);

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
