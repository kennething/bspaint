export const useToolStore = defineStore("toolStore", () => {
  const activeTool = ref<Tool>("brush");
  const zoomLevel = ref(1);

  const primaryColor = ref("#000000");
  const secondaryColor = ref("#ffffff");
  const recentColors = ref<string[]>(new Array(10).fill("#000000"));

  const brushSize = ref(5);

  const fontSize = ref(24);
  const fontFamily = ref<FontFamily>("Comic Sans MS");

  watch(primaryColor, (newColor) => setColor("primary", newColor));
  watch(secondaryColor, (newColor) => setColor("secondary", newColor));

  /** sets the color and also updates the recent colors list */
  function setColor(type: "primary" | "secondary", color: string) {
    if (type === "primary") primaryColor.value = color;
    else secondaryColor.value = color;

    if (!recentColors.value.includes(color)) {
      recentColors.value.unshift(color);
      if (recentColors.value.length > 10) recentColors.value.pop();
    }

    useUpdateBrush();
  }

  return { activeTool, primaryColor, secondaryColor, recentColors, brushSize, fontSize, fontFamily, zoomLevel, setColor };
});
