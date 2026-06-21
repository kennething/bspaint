import { FabricImage, IText, Point, type Canvas, type TPointerEventInfo } from "fabric";

export type Tool = "brush" | "fill" | "eyedropper" | "text" | "select"; // TODO: add fill tool

/**
 * @param canvas reference to the canvas
 * @param setZoomLevel a function that sets the value of `zoomLevel` in `canvasStore`
 */
export function setupScroll(canvas: Canvas, setZoomLevel: (zoom: number) => void) {
  const config = useRuntimeConfig();

  canvas.on("mouse:wheel", (event) => {
    event.e.preventDefault();
    event.e.stopPropagation();

    if (event.e.ctrlKey || event.e.metaKey) return handleZoom(event);
    handleScroll(event);
  });

  function handleZoom(event: TPointerEventInfo<WheelEvent>) {
    const delta = event.e.deltaY;
    let zoom = canvas.getZoom();

    zoom *= 0.999 ** delta;
    if (zoom > config.public.maxZoom) zoom = config.public.maxZoom;
    if (zoom < config.public.minZoom) zoom = config.public.minZoom;

    setZoomLevel(zoom);
    canvas.zoomToPoint(new Point(event.e.offsetX, event.e.offsetY), zoom);
  }
  function handleScroll(event: TPointerEventInfo<WheelEvent>) {
    const currentTransform = canvas.viewportTransform;
    if (!currentTransform) return console.warn("setupScroll no viewportTransform");

    currentTransform[4] -= event.e.deltaX;
    currentTransform[5] -= event.e.deltaY;
    canvas.zoomToPoint(new Point(event.e.offsetX, event.e.offsetY), canvas.getZoom());
  }
}

/**
 * @param canvas reference to the canvas
 * @param getActiveTool a function that gets the value of `activeTool` in `toolStore`
 * @param getFontSettings a function that gets the values of `fontSize` and `fontFamily` in `toolStore`
 * @param getColors a function that gets the values of `primaryColor` and `secondaryColor` in `toolStore`
 * @param getLayerId a function that gets the value of `activeLayerId` in `canvasStore`
 * @param setColor a function that sets the primary or secondary color in `toolStore`
 * @param setTool a function that sets the active tool in `toolStore`
 */
export function setupMouseDown(
  canvas: Canvas,
  getActiveTool: () => Tool,
  getFontSettings: () => { fontSize: number; fontFamily: string },
  getColors: () => { primary: string; secondary: string },
  getLayerId: () => number,
  setColor: (type: "primary" | "secondary", color: string) => void,
  setTool: (tool: Tool) => void
) {
  canvas.on("mouse:down", (event) => {
    const isOnBackground = getLayerId() === 0;
    const activeTool = getActiveTool();
    const isLeftClick = "button" in event.e && event.e.button === 0;

    if (activeTool === "eyedropper") {
      const pointer = canvas.getViewportPoint(event.e);
      const ctx = canvas.getContext();

      const pixel = ctx.getImageData(pointer.x, pointer.y, 1, 1).data;
      if (!pixel) return console.warn("setupMouseDown eyedropper no pixel data");
      if (pixel.some((value) => value === undefined)) return console.warn("setupMouseDown eyedropper some pixel data missing");

      const hex = rgbToHex(pixel[0]!, pixel[1]!, pixel[2]!);
      setColor(isLeftClick ? "primary" : "secondary", hex);
      setTool("brush");
    } // eyedropper
    else if (activeTool === "text" && !event.target && !isOnBackground) {
      const pointer = canvas.getViewportPoint(event.e);

      const { primary, secondary } = getColors();
      const { fontFamily, fontSize } = getFontSettings();

      const text = new IText("Type here", {
        left: pointer.x, // TODO: fix positions when camera moved from default
        top: pointer.y,
        fontFamily,
        fontSize,
        fill: isLeftClick ? primary : secondary,
        layerId: getLayerId()
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
      setTool("select");
    } // text
  });
}

/**
 * @param canvas reference to the canvas
 * @param setZoomLevel a function that sets the value of `zoomLevel` in `canvasStore`
 */
export function resetZoom(canvas: Canvas, setZoomLevel: (zoom: number) => void) {
  canvas.setZoom(1);
  setZoomLevel(1);
  canvas.viewportTransform[4] = 0; // x
  canvas.viewportTransform[5] = 0; // y
  canvas.requestRenderAll();
}

/**
 * @param canvas reference to the canvas
 * @param event the paste event
 * @param getLayerId a function that gets the value of `activeLayerId` in `canvasStore`
 * @param setTool a function that sets the active tool in `toolStore`
 */
export function handlePaste(canvas: Canvas, event: ClipboardEvent, getLayerId: () => number, setTool: (tool: Tool) => void) {
  const items = event.clipboardData?.items;
  if (!items) return console.warn("handlePaste no clipboard items");

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

      const img = await FabricImage.fromURL(event.target.result);
      img.set({ layerId: getLayerId() });
      canvas.add(img);
      canvas.setActiveObject(img);
      setTool("select");
    };
    reader.readAsDataURL(blob);
  }
}
