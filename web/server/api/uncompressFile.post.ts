import { brotliDecompressSync } from "zlib";

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event);
  if (!files) return sendError(event, createError({ statusCode: 400, statusMessage: "Missing form data" }));
  const file = files.find((f) => f.name === "file");
  if (!file) return sendError(event, createError({ statusCode: 400, statusMessage: "Missing file" }));

  const json = brotliDecompressSync(file.data);
  return JSON.parse(json.toString("utf-8"));
});
