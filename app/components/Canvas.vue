<template>
  <canvas
    ref="canvas"
    width="1920"
    height="1080"
    class="pr-60"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  ></canvas>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentColor, currentTool } = storeToRefs(userStore);

const canvas = useTemplateRef("canvas");
const context = ref<CanvasRenderingContext2D | null>(null);

const history = ref<string[]>([]);
const historyIndex = ref(-1);

const isMouseDown = ref(false);

onMounted(() => {
  if (!canvas.value) return;

  context.value = canvas.value.getContext("2d");
  if (!context.value) return;

  context.value.lineCap = "round";
  context.value.lineJoin = "round";
  context.value.fillStyle = "white";
  context.value.fillRect(0, 0, canvas.value.width, canvas.value.height);
  saveHistory();
});

function saveHistory() {
  if (!canvas.value) return;
  const dataUrl = canvas.value.toDataURL();

  if (historyIndex.value < history.value.length - 1)
    history.value = history.value.slice(0, historyIndex.value + 1);

  history.value.push(dataUrl);
  historyIndex.value++;
}

function restoreHistoryState() {
  if (!canvas.value || !context.value) return;

  const dataUrl = history.value[historyIndex.value]!;
  const image = new Image();

  image.onload = () => {
    if (!canvas.value || !context.value) return;
    context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    context.value.drawImage(image, 0, 0);
  };
  image.src = dataUrl;
}

function undo() {
  if (historyIndex.value <= 0) return;
  historyIndex.value--;
  restoreHistoryState();
}

function redo() {
  if (historyIndex.value >= history.value.length - 1) return;
  historyIndex.value++;
  restoreHistoryState();
}

function handleKeybinds(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) {
    if (event.key === "z") {
      undo();
      return event.preventDefault();
    }
    if (event.key === "y") {
      redo();
      return event.preventDefault();
    }
  }
}
onMounted(() => window.addEventListener("keydown", handleKeybinds));
onUnmounted(() => window.removeEventListener("keydown", handleKeybinds));

function handleMouseDown(event: MouseEvent) {
  if (!context.value) return;

  isMouseDown.value = true;

  if (currentTool.value === "brush") {
    context.value.beginPath();
    context.value.strokeStyle = currentColor.value;
    context.value.lineWidth = userStore.brush.radius;
    context.value.moveTo(event.offsetX, event.offsetY);
    return;
  }

  if (currentTool.value === "eraser") {
    context.value.beginPath();
    context.value.strokeStyle = "white";
    context.value.lineWidth = userStore.eraser.radius;
    context.value.moveTo(event.offsetX, event.offsetY);
    return;
  }
}

function handleMouseMove(event: MouseEvent) {
  if (!context.value || !isMouseDown.value) return;

  context.value.lineTo(event.offsetX, event.offsetY);
  context.value.stroke();
}

function handleMouseUp(event: MouseEvent) {
  if (!isMouseDown.value) return;

  isMouseDown.value = false;
  saveHistory();
}
</script>

<style scoped></style>
