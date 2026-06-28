/** returns the actual svg string if `to` is `svg`
 *
 * returns a blob url if `to` is `png`, `jpg`, or `webp`
 */
export async function useCanvasToImage(to: "svg" | "png" | "jpg" | "webp", getBlob?: false): Promise<string>;
/** @param getBlob returns a blob instead of blob url if `to` is `png`, `jpg`, or `webp` */
export async function useCanvasToImage(to: "png" | "jpg" | "webp", getBlob: true): Promise<Blob>;
export async function useCanvasToImage(to: "svg" | "png" | "jpg" | "webp", getBlob = false): Promise<string | Blob> {
  const canvasStore = useCanvasStore();
  const { fabricCanvas: canvas, canvasSize } = storeToRefs(canvasStore);

  const svg = canvas.value!.toSVG({
    suppressPreamble: true,
    width: `${canvasSize.value.width}px`,
    height: `${canvasSize.value.height}px`,
    viewBox: { x: 0, y: 0, width: canvasSize.value.width, height: canvasSize.value.height }
  });

  if (to === "svg") return svg;

  // * cant just do canvas.toDataUrl cuz need good cropping
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const image = new Image();
    image.src = url;
    image.onerror = reject;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvasSize.value.width;
      canvas.height = canvasSize.value.height;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("useCanvasToImage no blob"));
          resolve(getBlob ? blob : URL.createObjectURL(blob));
        },
        `image/${to === "jpg" ? "jpeg" : to}`
      );
    };
  });
}
