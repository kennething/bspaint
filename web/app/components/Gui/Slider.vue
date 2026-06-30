<template>
  <GuiMenu class="flex w-full items-center justify-center gap-1 px-1.5" :class="{ 'rounded-full!': isMac }">
    <div class="flex w-9 items-center justify-center">
      <div v-if="showManualInput" class="flex items-center justify-center">
        <label :for="`number-${nameId}`" class="sr-only">{{ name }}</label>
        <input ref="manual-input" :id="`number-${nameId}`" type="number" class="my-1.25 h-full w-full" :min="min" :max="max" v-model.number="model" @blur="inputOff" @change="inputOff" />
      </div>
      <button
        v-else
        @click="inputOn"
        class="w-full"
        :aria-label="`Change ${name} value`"
        :data-tip="buttonTooltipDirection ? `${customButtonTooltip || name}` : undefined"
        :class="{
          'du-tooltip': buttonTooltipDirection,
          'du-tooltip-top': buttonTooltipDirection === 'top',
          'du-tooltip-bottom': buttonTooltipDirection === 'bottom',
          'du-tooltip-left': buttonTooltipDirection === 'left',
          'du-tooltip-right': buttonTooltipDirection === 'right'
        }"
      >
        <img class="size-7 p-1" :src="image" aria-hidden="true" />
      </button>
    </div>

    <div
      class="du-tooltip flex items-center justify-center"
      :class="{ 'du-tooltip-bottom': !tooltipPosition || tooltipPosition === 'bottom' }"
      :data-tip="tooltipFormat ? tooltipFormat(model!) : model?.toFixed(2)"
    >
      <label :for="`slider-${nameId}`" class="sr-only">{{ name }}</label>
      <input
        :id="`slider-${nameId}`"
        class="h-1 w-full appearance-none rounded-full outline-none"
        :class="isMac ? 'slider-input-mac bg-neutral-200/80' : 'slider-input bg-neutral-300'"
        type="range"
        :min="isSkewed ? 0 : min"
        :max="isSkewed ? 100 : max"
        :step="step"
        v-model.number="tempModel"
        @change="emit('on-change')"
      />
    </div>
  </GuiMenu>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: KeybindName | (string & {});
  image: string;
  customButtonTooltip?: string;
  /** tooltip for the button.img on the left */
  buttonTooltipDirection?: "top" | "bottom" | "left" | "right";
  min: number;
  max: number;
  step?: number;
  isSkewed?: boolean;
  tooltipFormat?: (value: number) => string;
  /** defaults to bottom */
  tooltipPosition?: "top" | "bottom";
}>();
const emit = defineEmits<{
  "on-change": [void];
}>();

const model = defineModel<number>();

const userStore = useUserStore();
const { isMac } = storeToRefs(userStore);

const tempModel = ref(props.isSkewed ? unskew(model.value!) : model.value);
const skipSkew = ref(false);
watch(tempModel, (newValue) => {
  if (skipSkew.value) return (skipSkew.value = false);
  if (!props.isSkewed) return (model.value = newValue);

  model.value = skew(newValue!);
});
watch(model, (newValue) => {
  if (!props.isSkewed) {
    if (newValue !== tempModel.value) tempModel.value = newValue!;
    return;
  }

  if (newValue !== skew(tempModel.value!)) {
    tempModel.value = unskew(newValue!);
    skipSkew.value = true;
  }
});
/** takes percent 0-100 and turns into actual value min-max */
function skew(value: number) {
  if (value === 0) return props.min;
  const min = props.min || 1;
  return min * Math.pow(props.max / min, value / 100);
}
/** takes actual value min-max and turns into percent 0-100 */
function unskew(value: number) {
  if (value === props.min) return 0;
  const min = props.min || 1;
  return (Math.log(value / min) / Math.log(props.max / min)) * 100;
}

const nameId = props.name.toLowerCase().replace(/\s+/g, "-");

const showManualInput = ref(false);
const manualInput = useTemplateRef("manual-input");

let unroundedValue: number | null = null;
let roundedValue: number | null = null;
async function inputOn() {
  userStore.stopKeybinds();
  unroundedValue = model.value!;
  model.value = model.value && model.value >= 1 ? Math.round(model.value!) : Number(model.value!.toFixed(2));
  roundedValue = model.value;

  showManualInput.value = true;

  await nextTick();

  manualInput.value?.focus();
  manualInput.value?.select();
}
function inputOff() {
  userStore.restartKeybinds();
  showManualInput.value = false;

  if (model.value === roundedValue) {
    model.value = unroundedValue!;
    roundedValue = null;
    return (unroundedValue = null);
  }

  model.value = model.value === undefined ? props.min : Math.min(Math.max(model.value, props.min), props.max);

  emit("on-change");
}
</script>

<style scoped>
@reference "../../assets/main.css";

.slider-input-mac::-webkit-slider-thumb {
  @apply h-4 w-5 cursor-pointer appearance-none rounded-full border border-neutral-300/50 bg-neutral-200/50 shadow shadow-neutral-300/50 backdrop-blur-md transition-transform;
}
.slider-input-mac::-webkit-slider-thumb:hover {
  @apply scale-125 border-neutral-400/50! bg-neutral-300/50!;
}

.slider-input::-webkit-slider-thumb {
  @apply h-5 w-4 cursor-pointer appearance-none rounded border border-neutral-300 bg-blue-500;
}
</style>
