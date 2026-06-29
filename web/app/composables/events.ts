import { ActiveSelection, Circle, Ellipse, FabricImage, FabricObject, IText, Point, Rect, Triangle, type TPointerEvent, type TPointerEventInfo } from "fabric";

export function useSetupScroll() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, lastMousePosEvent } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("setupScroll no fabricCanvas");

  const toolStore = useToolStore();
  const { zoomLevel } = storeToRefs(toolStore);
  const userStore = useUserStore();
  const { isMac } = storeToRefs(userStore);
  const config = useRuntimeConfig();

  canvas.value.on("mouse:wheel", (event) => {
    event.e.preventDefault();
    event.e.stopPropagation();

    if ((!isMac.value && event.e.ctrlKey) || (isMac.value && event.e.metaKey)) return handleZoom(event);
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

    lastMousePosEvent.value = event;
    useMousePosTracking(event);
    useBrushPreview(event);
    useTextPreview(event);
  }
}

/** @param event uses the last mouse position event if not provided */
export function useMousePosTracking(event?: TPointerEventInfo<TPointerEvent | WheelEvent>) {
  const canvasStore = useCanvasStore();

  if (!event) event = canvasStore.lastMousePosEvent;
  if (!event) return console.warn("useMousePosTracking no event");

  canvasStore.mousePos.x = event.scenePoint.x;
  canvasStore.mousePos.y = event.scenePoint.y;
}
/** @param event uses the last mouse position event if not provided */
export function useBrushPreview(event?: TPointerEventInfo<TPointerEvent | WheelEvent>) {
  const canvasStore = useCanvasStore();
  const toolStore = useToolStore();

  if (!canvasStore.fabricCanvas) return console.warn("setupMouseMove handleBrushPreview no fabricCanvas");
  if (!event) event = canvasStore.lastMousePosEvent;
  if (!event) return console.warn("useBrushPreview no event"); // is called without event by useUpdateBrush by onMounted in Canvas

  if (toolStore.activeTool === "brush") {
    const existing = canvasStore.fabricCanvas.getObjects().find((obj) => obj.name === "brushPreview");
    if (existing) canvasStore.fabricCanvas.remove(existing);

    const brushPreview = new Circle({
      left: event.scenePoint.x,
      top: event.scenePoint.y,
      radius: Math.max(toolStore.brushSize / 2 - 0.5, 0.05),
      fill: toolStore.primaryColor,
      stroke: toolStore.primaryColor,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      name: "brushPreview",
      opacity: canvasStore.activeLayer.opacity / 100
    });
    canvasStore.fabricCanvas.add(brushPreview);
    canvasStore.fabricCanvas.requestRenderAll();
  } // brush
}
/** @param event uses the last mouse position event if not provided */
export function useTextPreview(event?: TPointerEventInfo<TPointerEvent | WheelEvent>) {
  const canvasStore = useCanvasStore();
  const toolStore = useToolStore();

  if (!canvasStore.fabricCanvas) return console.warn("setupMouseMove handleBrushPreview no fabricCanvas");
  if (!event) event = canvasStore.lastMousePosEvent;
  if (!event) return console.warn("useTextPreview no event");

  if (toolStore.activeTool === "text") {
    const existing = canvasStore.fabricCanvas.getObjects().find((obj) => obj.name === "textPreview");
    if (existing) canvasStore.fabricCanvas.remove(existing);

    const textPreview = new Rect({
      left: event.scenePoint.x,
      top: event.scenePoint.y,
      width: toolStore.fontSize * 0.1,
      height: toolStore.fontSize,
      fill: toolStore.primaryColor,
      stroke: toolStore.primaryColor,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      name: "textPreview",
      opacity: canvasStore.activeLayer.opacity / 100
    });
    canvasStore.fabricCanvas.add(textPreview);
    canvasStore.fabricCanvas.requestRenderAll();
  } // text
}

export function useSetupMouseDown() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, activeLayer, activeLayerId, isMiddleMousePanning } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("setupScroll no fabricCanvas");

  const toolStore = useToolStore();
  const { activeTool, primaryColor, secondaryColor, fontFamily, fontSize, isCreatingShape, createShapeStartPos } = storeToRefs(toolStore);

  const userStore = useUserStore();

  canvas.value.on("mouse:down", (event) => {
    if (!canvas.value) return console.warn("setupMouseDown no fabricCanvas");

    isMiddleMousePanning.value = "button" in event.e && event.e.button === 1;
    if (isMiddleMousePanning.value) return;

    const isLeftClick = "button" in event.e && event.e.button === 0;

    if (["brush", "text", "shape"].includes(activeTool.value)) {
      if (!isLeftClick) {
        const temp = primaryColor.value;
        primaryColor.value = secondaryColor.value;
        secondaryColor.value = temp;
        useUpdateBrush();
      }
    } // brush/text/shape
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
      const text = new IText("", {
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
    else if (activeTool.value === "shape" && !event.target && isLeftClick) {
      isCreatingShape.value = true;
      createShapeStartPos.value = { x: event.scenePoint.x, y: event.scenePoint.y };
    } // shape
  });
}

export function useSetupMouseUp() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, activeLayerId, isMiddleMousePanning } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("setupMouseUp no fabricCanvas");

  const toolStore = useToolStore();
  const { isCreatingShape, createShapeStartPos, strokeWidth, cornerRadius, selectedShape } = storeToRefs(toolStore);

  canvas.value.on("mouse:up", () => {
    if (!canvas.value) return console.warn("setupMouseUp no fabricCanvas");

    if (isMiddleMousePanning.value) isMiddleMousePanning.value = false;
    if (isCreatingShape.value) {
      isCreatingShape.value = false;

      const shapePreview = canvas.value.getObjects().find((obj) => obj.name === "shapePreview");
      if (!shapePreview) return;

      shapePreview.set({
        selectable: true,
        evented: true,
        excludeFromExport: false,
        name: undefined,
        layerId: activeLayerId.value
      });

      canvasStore.saveHistory();
      useSetTool("select");
      canvas.value.setActiveObject(shapePreview);
      canvas.value.requestRenderAll();
    } // creating shape
  });
}

export function useSetupMouseMove() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, lastMousePosEvent, isMiddleMousePanning } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("setupMouseMove no fabricCanvas");

  const toolStore = useToolStore();
  const { activeTool, primaryColor, secondaryColor, isCreatingShape, createShapeStartPos, strokeWidth, cornerRadius, selectedShape } = storeToRefs(toolStore);

  canvas.value.on("mouse:move", (event) => {
    if (!canvas.value) return console.warn("setupMouseMove no fabricCanvas");

    if (activeTool.value === "shape") canvas.value.setCursor("crosshair");

    if (isMiddleMousePanning.value && "offsetX" in event.e) {
      canvas.value.viewportTransform[4] += event.e.movementX;
      canvas.value.viewportTransform[5] += event.e.movementY;
      canvas.value.requestRenderAll();
    } // middle mouse panning
    if (isCreatingShape.value) {
      const existing = canvas.value.getObjects().find((obj) => obj.name === "shapePreview");
      if (existing) canvas.value.remove(existing);

      if (activeTool.value !== "shape") return (isCreatingShape.value = false);

      const width = event.scenePoint.x - createShapeStartPos.value!.x;
      const height = event.scenePoint.y - createShapeStartPos.value!.y;

      const left = width >= 0 ? createShapeStartPos.value!.x + width / 2 : event.scenePoint.x + Math.abs(width) / 2;
      const top = width >= 0 ? createShapeStartPos.value!.y + height / 2 : event.scenePoint.y + Math.abs(height) / 2;

      let shape: FabricObject;
      if (selectedShape.value === "rectangle") shape = new Rect({ left, top, width: Math.abs(width), height: Math.abs(height), rx: cornerRadius.value, ry: cornerRadius.value });
      else if (selectedShape.value === "circle") shape = new Ellipse({ left, top, rx: Math.abs(width) / 2, ry: Math.abs(height) / 2 });
      else shape = new Triangle({ left, top, width: Math.abs(width), height: Math.abs(height) });

      shape.set({
        fill: primaryColor.value,
        stroke: secondaryColor.value,
        strokeWidth: strokeWidth.value,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        name: "shapePreview",
        opacity: canvasStore.activeLayer.opacity / 100
      });

      canvas.value.add(shape);
      useRedrawBoundingRect();
      canvas.value.requestRenderAll();
    } // creating shape

    lastMousePosEvent.value = event;
    useMousePosTracking(event);
    useBrushPreview(event);
    useTextPreview(event);
  });
}

export function useSetupSelection() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("setupScroll no fabricCanvas");

  const toolStore = useToolStore();
  const { selectedObject, stopWatchers } = storeToRefs(toolStore);

  canvas.value.on("selection:created", (event) => {
    if (event.selected.length === 1) selectedObject.value = event.selected[0];
  });
  canvas.value.on("selection:updated", (event) => {
    if (event.selected.length === 1) selectedObject.value = event.selected[0];
  });
  // canvas.value.on("selection:updated", (event) => selectedObjects.value.push(...event.selected.filter((obj) => !selectedObjects.value.includes(obj))));
  canvas.value.on("selection:cleared", () => {
    stopWatchers.value.forEach((stopWatcher) => stopWatcher());
    stopWatchers.value = [];
    selectedObject.value = undefined;
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
  if (!items || !items.length || Array.from(items).every((item) => item.kind !== "file")) return pasteFromFabricClipboard();

  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, fabricClipboard, lastCopiedContent, activeLayerId } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("handlePaste no fabricCanvas");

  for (const item of items) {
    if (item.kind !== "file") continue;

    const blob = item.getAsFile();
    if (!blob || (lastCopiedContent.value?.name === blob.name && lastCopiedContent.value?.size === blob.size && lastCopiedContent.value?.type === blob.type)) return pasteFromFabricClipboard();

    lastCopiedContent.value = blob;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (!event.target || !event.target.result) return console.warn("handlePaste no file data");
      if (event.target.result instanceof ArrayBuffer) return console.warn("handlePaste file data is ArrayBuffer, expected string");
      if (!canvas.value) return console.warn("handlePaste reader onload no fabricCanvas");

      const img = await FabricImage.fromURL(event.target.result);
      fabricClipboard.value = img;
      img.set({ layerId: activeLayerId.value });
      canvas.value.add(img);
      canvas.value.setActiveObject(img);
      useSetTool("select");
    };
    reader.readAsDataURL(blob);
  }
}

async function pasteFromFabricClipboard() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, fabricClipboard, activeLayerId } = storeToRefs(canvasStore);
  if (!canvas.value) return console.warn("handlePaste no fabricCanvas");
  if (!fabricClipboard.value) return console.warn("handlePaste no fabricClipboard to paste");

  const clonedObj = await fabricClipboard.value.clone();
  if (!clonedObj) return console.warn("handlePaste no fabricClipboard to clone");
  clonedObj.set({ layerId: activeLayerId.value, left: clonedObj.left + 10, top: clonedObj.top + 10 });

  if (clonedObj instanceof ActiveSelection) {
    clonedObj.canvas = canvas.value;
    clonedObj.forEachObject((obj) => {
      obj.set({ layerId: activeLayerId.value });
      canvas.value?.add(obj);
    });
    clonedObj.setCoords();
  } else canvas.value.add(clonedObj);

  fabricClipboard.value.top += 10;
  fabricClipboard.value.left += 10;
  useSetTool("select");
  canvas.value.setActiveObject(clonedObj);
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
