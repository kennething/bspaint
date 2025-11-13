<template>
  <div class="relative">
    <canvas
      ref="canvas"
      width="1920"
      height="1080"
      class="canvas"
      :style="{ transform: `scale(${canvasScale})`, backgroundColor: currentColor.secondary }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @mousedown.right="handleMouseDown"
      @mousemove.right="handleMouseMove"
      @mouseup.right="handleMouseUp"
      @mouseleave.right="handleMouseUp"
    ></canvas>
    <canvas ref="overlay-canvas" width="1920" height="1080" class="canvas pointer-events-none absolute top-0 left-0 z-1 pr-60 pb-60" :style="{ transform: `scale(${canvasScale})` }"></canvas>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentColor, currentTool, tools, isDrawing, canvasScale } = storeToRefs(userStore);

const canvas = useTemplateRef("canvas");
const context = ref<CanvasRenderingContext2D | null>(null);
const overlayCanvas = useTemplateRef("overlay-canvas");
const overlayContext = ref<CanvasRenderingContext2D | null>(null);

const history = ref<string[]>([]);
const historyIndex = ref(-1);

onMounted(() => {
  if (!canvas.value || !overlayCanvas.value) return;

  context.value = canvas.value.getContext("2d", {
    willReadFrequently: true
  });
  overlayContext.value = overlayCanvas.value.getContext("2d");
  if (!context.value || !overlayContext.value) return;

  context.value.lineCap = "round";
  context.value.lineJoin = "round";
  context.value.fillStyle = "white";
  context.value.fillRect(0, 0, canvas.value.width, canvas.value.height);
  saveHistory();
  drawLoop();
});

function drawLoop() {
  requestAnimationFrame(drawLoop);
  if (!overlayContext.value || !overlayCanvas.value) return;

  const { width, height } = overlayCanvas.value;
  overlayContext.value.clearRect(0, 0, width, height);

  if (currentTool.value !== "select") return;
  const tool = tools.value.select;

  overlayContext.value.strokeStyle = "rgba(0, 0, 0, 0.8)";
  overlayContext.value.lineWidth = 1;
  overlayContext.value.setLineDash([4, 2]);

  if ((tool.selectState === "selected" || tool.selectState === "moving") && tool.selectedImageData) {
    overlayContext.value.putImageData(tool.selectedImageData, tool.selectionRect[0], tool.selectionRect[1]);
  }
  overlayContext.value.strokeRect(...tool.selectionRect);
  overlayContext.value.setLineDash([]);
}

function saveHistory() {
  if (!canvas.value) return;
  const dataUrl = canvas.value.toDataURL();

  if (historyIndex.value < history.value.length - 1) history.value = history.value.slice(0, historyIndex.value + 1);

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
    if ((event.shiftKey && event.key === "z") || event.key === "y") {
      redo();
      return event.preventDefault();
    }
    if (event.key === "z") {
      if (currentTool.value === "select" && ["selected", "moving"].includes(tools.value.select.selectState)) stampSelection();

      undo();
      return event.preventDefault();
    }
  }
}
onMounted(() => window.addEventListener("keydown", handleKeybinds));
onUnmounted(() => window.removeEventListener("keydown", handleKeybinds));

function handleZoom(event: WheelEvent) {
  if (!canvas.value || !(event.ctrlKey || event.metaKey)) return;
  event.preventDefault();

  const minScale = 0.1;
  const maxScale = 8;

  if (event.deltaY < 0) canvasScale.value = Math.min(canvasScale.value + 0.025, maxScale);
  else canvasScale.value = Math.max(canvasScale.value - 0.025, minScale);
}
onMounted(() => window.addEventListener("wheel", handleZoom, { passive: false }));
onUnmounted(() => window.removeEventListener("wheel", handleZoom));

function preventRightClick(event: MouseEvent) {
  if (event.button === 2) event.preventDefault();
}
onMounted(() => window.addEventListener("contextmenu", preventRightClick));
onUnmounted(() => window.removeEventListener("contextmenu", preventRightClick));

function handleMouseDown(event: MouseEvent) {
  if (!canvas.value || !context.value) return;

  const isLeftClick = event.button === 0;

  if (currentTool.value === "brush") {
    context.value.beginPath();
    context.value.strokeStyle = isLeftClick ? currentColor.value.primary : currentColor.value.secondary;
    context.value.lineWidth = tools.value.brush.radius;
    tools.value.brush.isDrawing = true;
    context.value.moveTo(event.offsetX, event.offsetY);
    return;
  }

  if (currentTool.value === "eraser") {
    context.value.beginPath();
    context.value.strokeStyle = currentColor.value.secondary;
    context.value.lineWidth = tools.value.eraser.radius;
    tools.value.eraser.isDrawing = true;
    context.value.moveTo(event.offsetX, event.offsetY);
    return;
  }

  if (currentTool.value === "fill") {
    const { width, height } = canvas.value;
    const { offsetX, offsetY } = event;

    const fillColor = hexToRgba(isLeftClick ? currentColor.value.primary : currentColor.value.secondary);
    const imageData = context.value.getImageData(0, 0, width, height);
    const data = imageData.data;

    const targetColor = getPixel(data, width, offsetX, offsetY);
    if (colorsMatch(targetColor, fillColor)) return;

    const queue = [[offsetX, offsetY]];
    while (queue.length) {
      const [x, y] = queue.shift()!;
      if (!x || !y || x < 0 || x >= width || y < 0 || y >= height) continue;

      const currentColor = getPixel(data, width, x, y);
      if (!colorsMatch(currentColor, targetColor)) continue;

      setPixel(data, width, x, y, fillColor);
      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }

    context.value.putImageData(imageData, 0, 0);
    saveHistory();
    return;
  }

  if (currentTool.value === "select") {
    const { offsetX, offsetY } = event;
    const tool = tools.value.select;

    if (tool.selectState === "selected") {
      const [x, y, w, h] = tool.selectionRect;
      if (offsetX >= x && offsetX <= x + w && offsetY >= y && offsetY <= y + h) {
        tool.selectState = "moving";
        tool.moveOffset = [offsetX - x, offsetY - y];
        return;
      }
      stampSelection();
    }

    tool.selectState = "selecting";
    tool.selectionRect = [offsetX, offsetY, 0, 0];
    return;
  }
}

function stampSelection() {
  if (!canvas.value || !context.value) return;
  const tool = tools.value.select;

  if (tool.selectedImageData) {
    context.value.fillStyle = currentColor.value.secondary;
    context.value.fillRect(...tool.previousSelectionRect);
    const [x, y] = tool.selectionRect;
    context.value.putImageData(tool.selectedImageData, x, y);
    tool.selectedImageData = null;
    saveHistory();
  }

  tool.selectState = "idle";
  tool.selectionRect = [0, 0, 0, 0];
  tool.previousSelectionRect = [0, 0, 0, 0];
}
watch(currentTool, (newTool) => {
  if (newTool !== "select") stampSelection();
});

function captureSelection() {
  if (!canvas.value || !context.value) return;
  const tool = tools.value.select;

  let [x, y, width, height] = tool.selectionRect;
  if (width < 0) {
    x += width;
    width = -width;
  }
  if (height < 0) {
    y += height;
    height = -height;
  }

  const canvasWidth = canvas.value.width;
  const canvasHeight = canvas.value.height;

  const selectionX = Math.max(0, x);
  const selectionY = Math.max(0, y);
  const selectionWidth = Math.min(selectionX + width, canvasWidth) - selectionX;
  const selectionHeight = Math.min(selectionY + height, canvasHeight) - selectionY;

  if (selectionWidth <= 0 || selectionHeight <= 0) return (tool.selectState = "idle");

  tool.selectionRect = [selectionX, selectionY, selectionWidth, selectionHeight];
  tool.previousSelectionRect = [...tool.selectionRect];
  tool.selectedImageData = context.value.getImageData(selectionX, selectionY, selectionWidth, selectionHeight);
  context.value.clearRect(selectionX, selectionY, selectionWidth, selectionHeight);
  tool.selectState = "selected";
}

function handleMouseMove(event: MouseEvent) {
  if (!context.value || currentTool.value === "fill") return;

  if (currentTool.value === "brush" || currentTool.value === "eraser") {
    if (!isDrawing.value) return;

    context.value.lineTo(event.offsetX, event.offsetY);
    context.value.stroke();
    return;
  }

  const { offsetX, offsetY } = event;

  const select = tools.value.select;
  if (select.selectState === "selecting") {
    select.selectionRect[2] = offsetX - select.selectionRect[0];
    select.selectionRect[3] = offsetY - select.selectionRect[1];
  } else if (select.selectState === "moving") {
    select.selectionRect[0] = offsetX - select.moveOffset[0];
    select.selectionRect[1] = offsetY - select.moveOffset[1];
  }

  if (select.selectState !== "selected") return;

  const [x, y, width, height] = select.selectionRect;
  if (offsetX >= x && offsetX <= x + width && offsetY >= y && offsetY <= y + height) document.body.style.cursor = "move";
  else document.body.style.cursor = "crosshair";
}

function handleMouseUp() {
  if (currentTool.value === "fill") return;

  if (currentTool.value === "brush" || currentTool.value === "eraser") {
    if (!isDrawing.value) return;

    tools.value.brush.isDrawing = false;
    tools.value.eraser.isDrawing = false;
    saveHistory();
    return;
  }

  const select = tools.value.select;
  if (select.selectState === "selecting") captureSelection();
  else if (select.selectState === "moving") select.selectState = "selected";
}
</script>

<style scoped>
.canvas {
  transform-origin: top left;
}
</style>
