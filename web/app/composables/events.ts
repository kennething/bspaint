import { Circle, FabricImage, IText, Point, Rect, type TPointerEvent, type TPointerEventInfo } from "fabric";

export function useSetupScroll() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("setupScroll no fabricCanvas");

  const toolStore = useToolStore();
  const { zoomLevel } = storeToRefs(toolStore);
  const config = useRuntimeConfig();

  canvas.value.on("mouse:wheel", (event) => {
    event.e.preventDefault();
    event.e.stopPropagation();

    if (event.e.ctrlKey || event.e.metaKey) return handleZoom(event);
    handleScroll(event);
  });

  function handleZoom(event: TPointerEventInfo<WheelEvent>) {
    if (!canvas.value) return console.warn("setupScroll handleZoom no fabricCanvas");

    const delta = event.e.deltaY;
    let zoom = canvas.value.getZoom();

    zoom *= 0.999 ** delta;
    if (zoom > config.public.maxZoom) zoom = config.public.maxZoom;
    if (zoom < config.public.minZoom) zoom = config.public.minZoom;

    zoomLevel.value = zoom;
    canvas.value.zoomToPoint(new Point(event.e.offsetX, event.e.offsetY), zoom);
  }
  function handleScroll(event: TPointerEventInfo<WheelEvent>) {
    if (!canvas.value) return console.warn("setupScroll no fabricCanvas");

    const currentTransform = canvas.value.viewportTransform;
    if (!currentTransform) return console.warn("setupScroll no viewportTransform");

    currentTransform[4] -= event.e.deltaX;
    currentTransform[5] -= event.e.deltaY;
    canvas.value.zoomToPoint(new Point(event.e.offsetX, event.e.offsetY), canvas.value.getZoom());

    handleMousePosTracking(event);
    handleBrushPreview(event);
  }
}
function handleMousePosTracking(event: TPointerEventInfo<TPointerEvent | WheelEvent>) {
  const canvasStore = useCanvasStore();

  canvasStore.mousePos.x = event.scenePoint.x;
  canvasStore.mousePos.y = event.scenePoint.y;
}
function handleBrushPreview(event: TPointerEventInfo<TPointerEvent | WheelEvent>) {
  const canvasStore = useCanvasStore();
  const toolStore = useToolStore();

  if (!canvasStore.fabricCanvas) return console.warn("setupMouseMove handleBrushPreview no fabricCanvas");

  if (toolStore.activeTool === "brush") {
    const existing = canvasStore.fabricCanvas.getObjects().find((obj) => obj.name === "brushPreview");
    if (existing) canvasStore.fabricCanvas.remove(existing);

    const brushPreview = new Circle({
      left: event.scenePoint.x,
      top: event.scenePoint.y,
      radius: toolStore.brushSize / 2 - 0.5,
      fill: toolStore.primaryColor,
      stroke: toolStore.primaryColor,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      name: "brushPreview",
      opacity: (canvasStore.layers.find((layer) => layer.id === canvasStore.activeLayerId)?.opacity ?? 100) / 100
    });
    canvasStore.fabricCanvas.add(brushPreview);
    canvasStore.fabricCanvas.requestRenderAll();
  } // brush
}

export function useSetupMouseDown() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, activeLayer, activeLayerId } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("setupScroll no fabricCanvas");

  const toolStore = useToolStore();
  const { activeTool, primaryColor, secondaryColor, fontFamily, fontSize } = storeToRefs(toolStore);

  const userStore = useUserStore();

  canvas.value.on("mouse:down", (event) => {
    if (!canvas.value) return console.warn("setupMouseDown no fabricCanvas");

    const isLeftClick = "button" in event.e && event.e.button === 0;

    if (["brush", "text"].includes(activeTool.value)) {
      if (!isLeftClick) {
        const temp = primaryColor.value;
        primaryColor.value = secondaryColor.value;
        secondaryColor.value = temp;
        useUpdateBrush();
      }
    } // brush/text
    else if (activeTool.value === "eyedropper") {
      const pointer = canvas.value.getViewportPoint(event.e);
      const ctx = canvas.value.getContext();

      const pixel = ctx.getImageData(pointer.x, pointer.y, 1, 1).data;
      if (!pixel) return console.warn("setupMouseDown eyedropper no pixel data");
      if (pixel.some((value) => value === undefined)) return console.warn("setupMouseDown eyedropper some pixel data missing");

      const hex = rgbToHex(pixel[0]!, pixel[1]!, pixel[2]!);
      toolStore.setColor(isLeftClick ? "primary" : "secondary", hex);
      useSetTool("brush");
    } // eyedropper

    if (activeLayer.value?.isLocked) return;

    if (activeTool.value === "text" && !event.target && isLeftClick) {
      const text = new IText("Bottom text", {
        left: event.scenePoint.x,
        top: event.scenePoint.y,
        fontFamily: fontFamily.value,
        fontSize: fontSize.value,
        fill: isLeftClick ? primaryColor.value : secondaryColor.value,
        layerId: activeLayerId.value
      });

      canvas.value.add(text);
      canvas.value.setActiveObject(text);

      text.on("editing:entered", userStore.stopKeybinds);
      text.on("editing:exited", userStore.restartKeybinds);
      text.enterEditing();
      text.selectAll();

      useSetTool("select");
    } // text
  });
}

export function useSetupMouseMove() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("setupScroll no fabricCanvas");

  canvas.value.on("mouse:move", (event) => {
    handleMousePosTracking(event);
    handleBrushPreview(event);
  });
}

export function useResetZoom() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("resetZoom no fabricCanvas");

  const toolStore = useToolStore();
  const { zoomLevel } = storeToRefs(toolStore);

  canvas.value.setZoom(1);
  zoomLevel.value = 1;
  canvas.value.viewportTransform[4] = 0; // x
  canvas.value.viewportTransform[5] = 0; // y
  canvas.value.requestRenderAll();
}

export function useHandlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items;
  if (!items) return console.warn("handlePaste no clipboard items");

  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, activeLayerId } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("handlePaste no fabricCanvas");

  for (const item of items) {
    if (item.kind !== "file") continue;

    const blob = item.getAsFile();
    if (!blob) {
      console.warn("handlePaste item is file but getAsFile returned null");
      continue;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (!event.target || !event.target.result) return console.warn("handlePaste no file data");
      if (event.target.result instanceof ArrayBuffer) return console.warn("handlePaste file data is ArrayBuffer, expected string");
      if (!canvas.value) return console.warn("handlePaste reader onload no fabricCanvas");

      const img = await FabricImage.fromURL(event.target.result);
      img.set({ layerId: activeLayerId.value });
      canvas.value.add(img);
      canvas.value.setActiveObject(img);
      useSetTool("select");
    };
    reader.readAsDataURL(blob);
  }
}

export function useHandleResize() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas } = storeToRefs(canvasStore);

  fabricCanvas.value?.setDimensions({
    width: window.innerWidth,
    height: window.innerHeight
  });
}

export function useRedrawBoundingRect() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, canvasSize, showBoundingRect } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("handleResize no fabricCanvas");

  const existingBoundingRect = canvas.value.getObjects().find((obj) => obj.name === "boundingRect");
  if (existingBoundingRect) canvas.value.remove(existingBoundingRect);
  const existingBoundingText = canvas.value.getObjects().find((obj) => obj.name === "boundingText");
  if (existingBoundingText) canvas.value.remove(existingBoundingText);

  const strokeWidth = 4 as const;
  const boundingRect = new Rect({
    left: canvasSize.value.width / 2,
    top: canvasSize.value.height / 2,
    width: canvasSize.value.width + strokeWidth,
    height: canvasSize.value.height + strokeWidth,
    fill: "transparent",
    strokeWidth,
    stroke: "#FF0000",
    selectable: false,
    evented: false,
    excludeFromExport: true,
    name: "boundingRect",
    opacity: showBoundingRect.value ? 1 : 0
  });
  canvas.value.add(boundingRect);
  canvas.value.sendObjectToBack(boundingRect);

  const boundingText = new IText(
    "only things INSIDE the canvas area will be exported.\nabove is a convenient red rectangle guide to make sure ur inside the canvas area.\nclick the coordinates in the bottom left to turn off the guide",
    {
      left: canvasSize.value.width / 2,
      top: canvasSize.value.height + 175,
      fontSize: 80,
      fill: "#FF0000",
      selectable: false,
      evented: false,
      excludeFromExport: true,
      name: "boundingText",
      opacity: showBoundingRect.value ? 1 : 0,
      fontFamily: "Comic Sans MS",
      textAlign: "center"
    }
  );
  canvas.value.add(boundingText);
  canvas.value.sendObjectToBack(boundingText);

  canvas.value.requestRenderAll();
}
