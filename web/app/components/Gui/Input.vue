<template>
  <div class="flex items-center justify-center gap-2">
    <label :for="nameId" class="shrink-0 text-xs font-light">{{ props.name }}</label>
    <GuiMenu class="focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
      <input
        :id="nameId"
        type="text"
        class="text-center focus:outline-none"
        :class="innerClass ? innerClass : 'w-20'"
        v-model="helperModel"
        @change="change"
        @focus="userStore.stopKeybinds"
        @blur="userStore.restartKeybinds"
        :min="min"
        :max="max"
        :maxlength="maxlength"
      />
    </GuiMenu>
  </div>
</template>

<script setup lang="ts" generic="T extends 'string' | 'number'">
const props = defineProps<{
  modelType: T;
  name: string;
  min?: T extends "number" ? number : never;
  max?: T extends "number" ? number : never;
  maxlength?: T extends "string" ? number : never;
  /** override the width of the input inside */
  innerClass?: string;
}>();
const emit = defineEmits<{ onChange: [void] }>();

const model = defineModel<string | number>();
const helperModel = ref<string | number>();
watch(model, (val) => (helperModel.value = val), { immediate: true });
watch(helperModel, (val) => {
  if (props.modelType !== "number") return (model.value = val);

  let numVal = Number(val);
  if (Number.isNaN(numVal)) numVal = props.min ?? 0;
  model.value = numVal;
});

const userStore = useUserStore();

const nameId = props.name.toLowerCase().replace(/\s+/g, "-");

function change() {
  if (props.modelType === "number") {
    if (Number.isNaN(Number(helperModel.value))) helperModel.value = props.min ?? 0;
  }
  emit("onChange");
}
</script>

<style scoped></style>
