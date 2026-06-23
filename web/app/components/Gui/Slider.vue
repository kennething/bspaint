<template>
  <GuiMenu class="flex w-full items-center justify-center gap-1 rounded-full! px-1.5">
    <div class="flex w-9 items-center justify-center">
      <div v-if="showManualInput" class="flex items-center justify-center">
        <label :for="`number-${nameId}`" class="sr-only">{{ name }}</label>
        <input ref="manual-input" :id="`number-${nameId}`" type="number" class="h-full w-full" :min="min" :max="max" v-model.number="model" @blur="inputOff" @change="inputOff" />
      </div>
      <button v-else @click="inputOn" class="w-full" :aria-label="`Change ${name} value`">
        <img class="w-full p-1" :src="image" aria-hidden="true" />
      </button>
    </div>

    <label :for="`slider-${nameId}`" class="sr-only">{{ name }}</label>
    <input
      :id="`slider-${nameId}`"
      class="slider-input du-tooltip du-tooltip-bottom h-1 w-full appearance-none rounded-full bg-neutral-200/80 outline-none"
      type="range"
      :data-tip="model"
      :min="min"
      :max="max"
      :step="step"
      v-model.number="model"
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
}>();
const emit = defineEmits<{
  "on-change": [void];
}>();

const model = defineModel<number>();

const nameId = props.name.toLowerCase().replace(/\s+/g, "-");

const showManualInput = ref(false);
const manualInput = useTemplateRef("manual-input");

async function inputOn() {
  showManualInput.value = true;
  await nextTick();
  manualInput.value?.focus();
  manualInput.value?.select();
}
function inputOff() {
  showManualInput.value = false;
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
