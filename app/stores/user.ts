export const useUserStore = defineStore("userStore", () => {
  const currentColor = ref("#000000ff");
  const currentTool = ref<ToolType>("brush");

  const brush = ref<Brush>({
    type: "brush",
    radius: 5,
  });

  const eraser = ref<Eraser>({
    type: "eraser",
    radius: 5,
  });

  return { currentColor, currentTool, brush, eraser };
});
