import { brotliCompressSync } from "zlib";

type Body = {
  canvasJson: object;
};

export default defineEventHandler(async (event) => {
  const { canvasJson } = await readBody<Body>(event);
  if (!canvasJson) return sendError(event, createError({ statusCode: 400, statusMessage: "Missing body fields" }));

  const json = JSON.stringify(canvasJson);
  const compressed = brotliCompressSync(Buffer.from(json));

  setHeader(event, "Content-Type", "application/octet-stream");
  return compressed;
});
