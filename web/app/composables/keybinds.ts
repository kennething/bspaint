export function useGetKeybindString(action: KeybindName | (string & {})) {
  const userStore = useUserStore();
  const { isMac, modifierKeySet } = storeToRefs(userStore);

  const keybind = keybinds.find((k) => k.action === action);
  if (!keybind) return;

  const useMacKeys = isMac.value && "macKeys" in keybind;
  const keys = useMacKeys ? keybind.macKeys : keybind.keys;

  let keybindKeys = "";
  keybindKeys += keys[0].map((key) => modifierKeySet.value[key]).join(" + ");
  // @ts-expect-error sybau
  keybindKeys += (keys[0].length === 0 ? "" : " + ") + (keys[1] in specialKeys ? specialKeys[keys[1]] : keys[1].toUpperCase());
  return keybindKeys;
}
