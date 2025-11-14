<template>
  <button class="absolute top-0 left-0 hidden" ref="outer"></button>
  <div class="relative">
    <canvas
      ref="canvas"
      width="500"
      height="500"
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
    <canvas ref="overlay-canvas" width="500" height="500" class="canvas pointer-events-none absolute top-0 left-0 z-1 pr-30 pb-30" :style="{ transform: `scale(${canvasScale})` }"></canvas>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { currentColor, canvasSize, currentTool, tools, isDrawing, history, historyIndex, undoEvent, redoEvent, resetEvent } = storeToRefs(userStore);

const outer = useTemplateRef("outer");
const canvas = useTemplateRef("canvas");
const context = ref<CanvasRenderingContext2D | null>(null);
const overlayCanvas = useTemplateRef("overlay-canvas");
const overlayContext = ref<CanvasRenderingContext2D | null>(null);

const canvasScale = ref(1);

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

watch(resetEvent, async (val) => {
  if (!val) return;

  if (!canvas.value || !context.value || !overlayCanvas.value || !overlayContext.value) return;
  context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

  history.value = [];
  historyIndex.value = -1;

  currentTool.value = "brush";
  canvasScale.value = 1;

  canvas.value.width = canvasSize.value[0];
  canvas.value.height = canvasSize.value[1];
  overlayCanvas.value.width = canvasSize.value[0];
  overlayCanvas.value.height = canvasSize.value[1];

  context.value.lineCap = "round";
  context.value.lineJoin = "round";
  context.value.fillStyle = "white";
  context.value.fillRect(0, 0, canvas.value.width, canvas.value.height);
  saveHistory();

  await nextTick();
  resetEvent.value = false;
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

  if (tool.selectState === "selecting") overlayContext.value.strokeRect(...tool.selectionRect);
  else if (tool.selectionCanvas && ["selected", "moving", "rotating", "resizing"].includes(tool.selectState)) {
    const [x, y, width, height] = tool.selectionRect;
    const translateX = x + width / 2;
    const translateY = y + height / 2;

    overlayContext.value.save();
    overlayContext.value.translate(translateX, translateY);
    overlayContext.value.rotate(tool.rotationAngle);

    overlayContext.value.drawImage(tool.selectionCanvas, -width / 2, -height / 2, width, height);
    overlayContext.value.strokeRect(-width / 2, -height / 2, width, height);

    overlayContext.value.restore();
  }

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
watch(undoEvent, async (newVal) => {
  if (newVal) undo();
  await nextTick();
  undoEvent.value = false;
});

function redo() {
  if (historyIndex.value >= history.value.length - 1) return;
  historyIndex.value++;
  restoreHistoryState();
}
watch(redoEvent, async (newVal) => {
  if (newVal) redo();
  await nextTick();
  redoEvent.value = false;
});

async function handleKeybinds(event: KeyboardEvent) {
  if (currentTool.value === "select" && event.key === "Backspace") {
    stampSelection(false);
    return event.preventDefault();
  }

  if (event.ctrlKey || event.metaKey) {
    if (currentTool.value === "select" && !["idle", "selecting"].includes(tools.value.select.selectState) && event.key === "c") {
      const image = new Image();
      const tool = tools.value.select;
      if (!canvas.value || !tool.selectionCanvas) return;
      image.src = tool.selectionCanvas.toDataURL();
      navigator.clipboard.write([
        new ClipboardItem({
          "image/png": fetch(image.src).then((res) => res.blob())
        })
      ]);
      return event.preventDefault();
    }
    if (event.key === "v" && canvas.value) {
      currentTool.value = "select";
      const tool = tools.value.select;
      if (tool.selectionCanvas) stampSelection();

      const [item] = await navigator.clipboard.read();
      if (!item) return;

      const data = await item.getType("image/png");
      if (!data) return;

      const image = new Image();
      image.onload = () => {
        if (!canvas.value || !context.value) return;
        tool.selectionRect = [0, 0, image.width, image.height];
        tool.selectionCanvas = document.createElement("canvas");
        tool.selectionCanvas.width = image.width;
        tool.selectionCanvas.height = image.height;
        tool.selectionCanvas.getContext("2d")!.drawImage(image, 0, 0);
        tool.selectState = "selected";
      };
      image.src = URL.createObjectURL(data);
      return event.preventDefault();
    }

    if (event.key === "z" && currentTool.value === "select" && ["selected", "moving"].includes(tools.value.select.selectState)) stampSelection();
    // * the rest of undo/redo is in Toolbar.vue
  }
}
onMounted(() => window.addEventListener("keydown", handleKeybinds));
onUnmounted(() => window.removeEventListener("keydown", handleKeybinds));

function changeCursor(event: KeyboardEvent) {
  if (currentTool.value !== "select") return (document.body.style.cursor = getCursorStyle(currentTool.value));

  if (event.shiftKey) document.body.style.cursor = "alias";
  else if (event.ctrlKey || event.metaKey) document.body.style.cursor = "nwse-resize";
  else document.body.style.cursor = "crosshair";
}
onMounted(() => window.addEventListener("keydown", changeCursor));
onMounted(() => window.addEventListener("keyup", changeCursor));
onUnmounted(() => window.removeEventListener("keydown", changeCursor));
onUnmounted(() => window.removeEventListener("keyup", changeCursor));

function handleZoom(event: WheelEvent) {
  if (!canvas.value || !(event.ctrlKey || event.metaKey)) return;
  event.preventDefault();

  const minScale = 0.25;
  const maxScale = 8;
  const scaleSpeed = canvasScale.value >= 4 ? 0.1 : canvasScale.value >= 2 ? 0.05 : 0.025;

  if (event.deltaY < 0) canvasScale.value = Math.round(Math.min(canvasScale.value + scaleSpeed, maxScale) * 100) / 100;
  else canvasScale.value = Math.round(Math.max(canvasScale.value - scaleSpeed, minScale) * 100) / 100;
  outer.value?.focus();
}
onMounted(() => window.addEventListener("wheel", handleZoom, { passive: false }));
onUnmounted(() => window.removeEventListener("wheel", handleZoom));

function preventRightClick(event: MouseEvent) {
  if (event.button === 2) event.preventDefault();
}
onMounted(() => window.addEventListener("contextmenu", preventRightClick));
onUnmounted(() => window.removeEventListener("contextmenu", preventRightClick));

function handleMouseDown(event: MouseEvent): void {
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
      if (isPointInSelection(offsetX, offsetY)) {
        tool.selectState = "moving";
        const translateX = tool.selectionRect[0] + tool.selectionRect[2] / 2;
        const translateY = tool.selectionRect[1] + tool.selectionRect[3] / 2;

        return void (tool.startInteractionData = {
          startMouseX: offsetX,
          startMouseY: offsetY,
          startRect: { ...tool.selectionRect },
          startAngle: tool.rotationAngle,
          startDistance: Math.hypot(offsetX - translateX, offsetY - translateY),
          startMouseAngle: Math.atan2(offsetY - translateY, offsetX - translateX)
        });
      }

      stampSelection();
    }

    tool.selectState = "selecting";
    tool.selectionRect = [offsetX, offsetY, 0, 0];
    return;
  }

  if (currentTool.value === "eyedropper") {
    const { offsetX, offsetY } = event;
    const imageData = context.value.getImageData(offsetX, offsetY, 1, 1);
    const data = imageData.data;
    const [r, g, b] = [data[0], data[1], data[2]];

    const hexColor = `#${((1 << 24) + ((r ?? 0) << 16) + ((g ?? 0) << 8) + (b ?? 0)).toString(16).slice(1)}`;
    if (isLeftClick) currentColor.value.primary = hexColor;
    else currentColor.value.secondary = hexColor;

    currentTool.value = "brush";
    return;
  }
}

function isPointInSelection(x: number, y: number) {
  if (!canvas.value || !context.value) return false;
  const tool = tools.value.select;

  if (!tool.selectionCanvas) return false;
  const [selectionX, selectionY, selectionWidth, selectionHeight] = tool.selectionRect;
  const translateX = selectionX + selectionWidth / 2;
  const translateY = selectionY + selectionHeight / 2;

  const distanceX = x - translateX;
  const distanceY = y - translateY;

  const rotateX = distanceX * Math.cos(-tool.rotationAngle) - distanceY * Math.sin(-tool.rotationAngle);
  const rotateY = distanceX * Math.sin(-tool.rotationAngle) + distanceY * Math.cos(-tool.rotationAngle);

  return rotateX >= -selectionWidth / 2 && rotateX <= selectionWidth / 2 && rotateY >= -selectionHeight / 2 && rotateY <= selectionHeight / 2;
}

function stampSelection(stampImage = true) {
  if (!canvas.value || !context.value) return;
  const tool = tools.value.select;

  if (tool.selectionCanvas) {
    context.value.fillStyle = currentColor.value.secondary;
    context.value.fillRect(...tool.previousSelectionRect);

    if (stampImage) {
      const [x, y, width, height] = tool.selectionRect;
      const translateX = x + width / 2;
      const translateY = y + height / 2;

      context.value.save();
      context.value.translate(translateX, translateY);
      context.value.rotate(tool.rotationAngle);
      context.value.drawImage(tool.selectionCanvas, -width / 2, -height / 2, width, height);
    }

    context.value.restore();
    tool.selectionCanvas = null;
    document.body.style.cursor = "crosshair";
    saveHistory();
  }

  tool.selectState = "idle";
  tool.selectionRect = [0, 0, 0, 0];
  tool.previousSelectionRect = [0, 0, 0, 0];
  tool.rotationAngle = 0;
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
  const imageData = context.value.getImageData(selectionX, selectionY, selectionWidth, selectionHeight);
  if (tool.isTransparent) {
    for (let i = 0; i < imageData.data.length; i += 4) {
      const [r, g, b] = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]];
      if (r === 255 && g === 255 && b === 255) imageData.data[i + 3] = 0;
    }
  }

  tool.selectionCanvas = document.createElement("canvas");
  tool.selectionCanvas.width = selectionWidth;
  tool.selectionCanvas.height = selectionHeight;
  tool.selectionCanvas.getContext("2d")!.putImageData(imageData, 0, 0);

  context.value.clearRect(selectionX, selectionY, selectionWidth, selectionHeight);
  tool.selectState = "selected";
}

function handleMouseMove(event: MouseEvent): void {
  if (!context.value || ["fill", "eyedropper"].includes(currentTool.value)) return;

  if (currentTool.value === "brush" || currentTool.value === "eraser") {
    if (!isDrawing.value) return;

    context.value.lineTo(event.offsetX, event.offsetY);
    context.value.stroke();
    return;
  }

  const { offsetX, offsetY } = event;

  const select = tools.value.select;
  const isManipulating = ["moving", "rotating", "resizing"].includes(select.selectState);

  if (select.selectState === "selecting") {
    select.selectionRect[2] = offsetX - select.selectionRect[0];
    select.selectionRect[3] = offsetY - select.selectionRect[1];
  } else if (isManipulating) {
    if (!select.startInteractionData) return;

    if (event.shiftKey) select.selectState = "rotating";
    else if (event.ctrlKey || event.metaKey) select.selectState = "resizing";
    else select.selectState = "moving";

    const { startMouseX, startMouseY, startRect, startAngle, startDistance, startMouseAngle } = select.startInteractionData;
    const translateX = startRect[0] + startRect[2] / 2;
    const translateY = startRect[1] + startRect[3] / 2;

    if (select.selectState === "moving") {
      const distanceX = offsetX - startMouseX;
      const distanceY = offsetY - startMouseY;
      select.selectionRect[0] = startRect[0] + distanceX;
      select.selectionRect[1] = startRect[1] + distanceY;
    } else if (select.selectState === "rotating") {
      const currentMouseAngle = Math.atan2(offsetY - translateY, offsetX - translateX);
      select.rotationAngle = startAngle + (currentMouseAngle - startMouseAngle);
    } else if (select.selectState === "resizing") {
      const currentDistance = Math.hypot(offsetX - translateX, offsetY - translateY);
      const scale = currentDistance / startDistance;

      if (scale > 0.05) {
        const newX = startRect[2] * scale;
        const newY = startRect[3] * scale;
        select.selectionRect[2] = newX;
        select.selectionRect[3] = newY;
        select.selectionRect[0] = translateX - newX / 2;
        select.selectionRect[1] = translateY - newY / 2;
      }
    }
  }

  if (!isManipulating) return;

  if (select.selectState === "moving") {
    const [x, y] = select.selectionRect;
    if (isPointInSelection(x, y)) return void (document.body.style.cursor = "move");
  }
  document.body.style.cursor = "crosshair";
}

function handleMouseUp() {
  if (["fill", "eyedropper"].includes(currentTool.value)) return;

  if (currentTool.value === "brush" || currentTool.value === "eraser") {
    if (!isDrawing.value) return;

    tools.value.brush.isDrawing = false;
    tools.value.eraser.isDrawing = false;
    saveHistory();
    return;
  }

  const select = tools.value.select;
  if (select.selectState === "selecting") captureSelection();
  else if (["moving", "rotating", "resizing"].includes(select.selectState)) {
    select.selectState = "selected";
    select.startInteractionData = null;
  }
}
</script>

<style scoped>
.canvas {
  transform-origin: top left;
}
</style>
