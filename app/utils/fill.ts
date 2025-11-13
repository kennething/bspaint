export type RGBA = [r: number, g: number, b: number, a: number];

export function hexToRgba(hex: string): RGBA {
  if (hex.startsWith("rgba")) return hex.match(/\d+/g)?.map(Number) as RGBA;

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1] ?? "0", 16),
        parseInt(result[2] ?? "0", 16),
        parseInt(result[3] ?? "0", 16),
        255,
      ]
    : [0, 0, 0, 255];
}

export function colorsMatch(color1: RGBA, color2: RGBA) {
  return (
    color1[0] === color2[0] &&
    color1[1] === color2[1] &&
    color1[2] === color2[2] &&
    color1[3] === color2[3]
  );
}

export function getPixel(
  data: ImageDataArray,
  width: number,
  x: number,
  y: number
): RGBA {
  const index = (y * width + x) * 4;
  return [data[index]!, data[index + 1]!, data[index + 2]!, data[index + 3]!];
}

export function setPixel(
  data: ImageDataArray,
  width: number,
  x: number,
  y: number,
  fillColor: RGBA
) {
  const index = (y * width + x) * 4;
  data[index] = fillColor[0];
  data[index + 1] = fillColor[1];
  data[index + 2] = fillColor[2];
  data[index + 3] = fillColor[3];
}
