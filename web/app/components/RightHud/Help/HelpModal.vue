<template>
  <Teleport to="body">
    <GuiMenu do-transition class="fixed top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 p-10 shadow-lg! shadow-neutral-400/50!" @click.stop>
      <div class="flex items-center justify-center gap-2">
        <p class="text-lg font-bold text-neutral-800">Wrong platform detected?</p>
        <GuiButtonGroup>
          <GuiInnerButton image="/icons/windows.svg" label="Switch to Windows" :tooltip-direction="tempIsMac ? 'top' : undefined" :is-disabled="!tempIsMac" @clicked="tempIsMac = false" />
          <GuiInnerButton image="/icons/apple.svg" label="Switch to MacOS" :tooltip-direction="tempIsMac ? undefined : 'top'" :is-disabled="tempIsMac" @clicked="tempIsMac = true" />
        </GuiButtonGroup>
      </div>

      <div class="hide-scrollbar items-between flex h-100 w-100 flex-col justify-start gap-4 overflow-y-scroll">
        <RightHudHelpKeybindSection :is-mac="tempIsMac" :keybinds="otherKeybinds" title="" />
        <RightHudHelpKeybindSection :is-mac="tempIsMac" :keybinds="toolKeybinds" title="Tools" />
        <RightHudHelpKeybindSection :is-mac="tempIsMac" :keybinds="canvasKeybinds" title="Canvas" />
        <RightHudHelpKeybindSection :is-mac="tempIsMac" :keybinds="layerKeybinds" title="Layers" />
      </div>

      <div class="mt-4 flex w-full items-center justify-end gap-2">
        <GuiButtonSingle image="/icons/close.svg" label="Cancel" @clicked="emit('close')" />
        <GuiButtonSingle
          :class="{ 'border-blue-100/90! bg-blue-100/70! hover:border-blue-200/70!': isMac !== tempIsMac }"
          :inner-class-override="isMac !== tempIsMac ? 'hover:bg-blue-200/50!' : ''"
          image="/icons/check.svg"
          label="Confirm"
          :is-disabled="isMac === tempIsMac"
          @clicked="save"
        />
      </div>
    </GuiMenu>
  </Teleport>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  close: [void];
}>();

const userStore = useUserStore();
const { isMac, modifierKeySet } = storeToRefs(userStore);

const tempIsMac = ref(isMac.value);

function save() {
  isMac.value = tempIsMac.value;
  modifierKeySet.value = modifierKeys[tempIsMac.value ? "mac" : "windows"];
  emit("close");
}

const canvasKeybinds = keybinds.filter((keybind) => keybind.category === "canvas");
const toolKeybinds = keybinds.filter((keybind) => keybind.category === "tools");
const layerKeybinds = keybinds.filter((keybind) => keybind.category === "layers");
const otherKeybinds = keybinds.filter((keybind) => keybind.category === "other");
</script>

<style scoped></style>
