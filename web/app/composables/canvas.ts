export async function useCanvasToImage() {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, canvasSize } = storeToRefs(canvasStore);

  const stripped = await canvas.value!.clone([]);
  stripped.forEachObject((obj) => {
    const left = obj.getX();
    const top = obj.getY();

    const width = obj.width * obj.scaleX;
    const height = obj.height * obj.scaleY;

    const topLeft: [x: number, y: number] = [left - width / 2, top - height / 2];
    const bottomLeft: [x: number, y: number] = [left - width / 2, top + height / 2];
    const topRight: [x: number, y: number] = [left + width / 2, top - height / 2];
    const bottomRight: [x: number, y: number] = [left + width / 2, top + height / 2];
    const points = [topLeft, bottomLeft, topRight, bottomRight];

    // TODO: fix
    const isOutsideCanvas = points.every(([x, y]) => x < 0 || x > canvasSize.value.width || y < 0 || y > canvasSize.value.height);
    if (isOutsideCanvas) stripped.remove(obj);
  });

  return stripped.toSVG({
    suppressPreamble: true,
    width: `${canvasSize.value.width}px`,
    height: `${canvasSize.value.height}px`,
    viewBox: { x: 0, y: 0, width: canvasSize.value.width, height: canvasSize.value.height }
  });
}
