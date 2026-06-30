import * as z from "zod/mini";

export const SettingsSchema = z.object({
  horizontalScrollAssist: z.boolean()
});

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

  const settings = ref<z.infer<typeof SettingsSchema>>({
    horizontalScrollAssist: true
  });

  return { isMac, disableKeybinds, modifierKeySet, stopKeybinds, restartKeybinds, settings };
});
