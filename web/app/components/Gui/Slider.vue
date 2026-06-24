<template>
  <GuiMenu class="flex w-full items-center justify-center gap-1 rounded-full! px-1.5">
    <div class="flex w-9 items-center justify-center">
      <div v-if="showManualInput" class="flex items-center justify-center">
        <label :for="`number-${nameId}`" class="sr-only">{{ name }}</label>
        <input ref="manual-input" :id="`number-${nameId}`" type="number" class="my-1.25 h-full w-full" :min="min" :max="max" v-model.number="model" @blur="inputOff" @change="inputOff" />
      </div>
      <button v-else @click="inputOn" class="w-full" :aria-label="`Change ${name} value`">
        <img class="w-full p-1" :src="image" aria-hidden="true" />
      </button>
    </div>

    <label :for="`slider-${nameId}`" class="sr-only">{{ name }}</label>
    <input
      :id="`slider-${nameId}`"
      class="slider-input du-tooltip h-1 w-full appearance-none rounded-full bg-neutral-200/80 outline-none"
      :class="{ 'du-tooltip-bottom': !tooltipPosition || tooltipPosition === 'bottom' }"
      type="range"
      :data-tip="tooltipFormat ? tooltipFormat(model!) : model?.toFixed(2)"
      :min="isSkewed ? 0 : min"
      :max="isSkewed ? 100 : max"
      :step="step"
      v-model.number="tempModel"
      @change="emit('on-change')"
    />
  </GuiMenu>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string;
  image: string;
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
  return props.min * Math.pow(props.max / props.min, value / 100);
}
/** takes actual value min-max and turns into percent 0-100 */
function unskew(value: number) {
  return (Math.log(value / props.min) / Math.log(props.max / props.min)) * 100;
}

const nameId = props.name.toLowerCase().replace(/\s+/g, "-");

const showManualInput = ref(false);
const manualInput = useTemplateRef("manual-input");

let unroundedValue: number | null = null;
async function inputOn() {
  unroundedValue = model.value!;
  model.value = Math.round(model.value!);

  showManualInput.value = true;

  await nextTick();

  manualInput.value?.focus();
  manualInput.value?.select();
}
function inputOff() {
  showManualInput.value = false;

  if (model.value === Math.round(unroundedValue!)) {
    model.value = unroundedValue!;
    return (unroundedValue = null);
  }

  model.value = model.value === undefined ? props.min : Math.min(Math.max(model.value, props.min), props.max);

  emit("on-change");
}
</script>

<style scoped>
@reference "../../assets/main.css";

.slider-input::-webkit-slider-thumb {
  @apply h-4 w-5 cursor-pointer appearance-none rounded-full border border-neutral-300/50 bg-neutral-200/50 shadow shadow-neutral-300/50 backdrop-blur-md transition-transform;
}
.slider-input::-webkit-slider-thumb:hover {
  @apply scale-125 border-neutral-400/50! bg-neutral-300/50!;
}
</style>
