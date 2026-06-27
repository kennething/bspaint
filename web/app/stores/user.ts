export const useUserStore = defineStore("userStore", () => {
  const isMac = ref(false);
  const modifierKeySet = ref<(typeof modifierKeys)["mac"] | (typeof modifierKeys)["windows"]>(modifierKeys.windows);

  const disableKeybinds = ref(false);
  function stopKeybinds() {
    disableKeybinds.value = true;
  }
  function restartKeybinds() {
    disableKeybinds.value = false;
  }

  return { isMac, disableKeybinds, modifierKeySet, stopKeybinds, restartKeybinds };
});
