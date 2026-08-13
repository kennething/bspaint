import * as z from "zod";

const AlphaColorSchema = z.templateLiteral(["#", z.hex().max(8)]);

export const CanvasJsonSchema = z.object({
  background: AlphaColorSchema,
  version: z.templateLiteral([z.int().min(0), ".", z.int().min(0), ".", z.int().min(0)]),
  objects: z.array(
    z.looseObject({
      angle: z.number().min(0).max(360),
      backgroundColor: AlphaColorSchema.optional(),
      excludeFromExport: z.literal(true),
      fill: z.union([AlphaColorSchema, z.literal("")]),
      fillRule: z.union([z.literal("nonzero"), z.literal("evenodd")]),
      flipX: z.boolean(),
      flipY: z.boolean(),
      globalCompositeOperation: z.string(),
      height: z.number(),
      width: z.number(),
      opacity: z.number().min(0).max(1),
      originX: z.union([z.literal("left"), z.literal("center"), z.literal("right")]),
      originY: z.union([z.literal("top"), z.literal("center"), z.literal("bottom")]),
      paintFirst: z.union([z.literal("stroke"), z.literal("fill")]),
      scaleX: z.number(),
      scaleY: z.number(),
      skewX: z.number(),
      skewY: z.number(),
      stroke: AlphaColorSchema,
      strokeLineCap: z.union([z.literal("butt"), z.literal("round"), z.literal("square")]),
      strokeLineJoin: z.union([z.literal("bevel"), z.literal("round"), z.literal("miter")]),
      strokeMiterLimit: z.number(),
      strokeUniform: z.boolean(),
      strokeWidth: z.number(),
      top: z.number(),
      left: z.number(),
      type: z.string(),
      visible: z.boolean(),
      version: z.templateLiteral([z.int().min(0), ".", z.int().min(0), ".", z.int().min(0)]),

      path: z
        .array(
          z
            .tuple([
              z
                .string()
                .uppercase()
                .regex(/^[A-Z]+$/)
            ])
            .rest(z.number())
        )
        .optional(),
      pathAlign: z.union([z.literal("left"), z.literal("center"), z.literal("right")]).optional(),
      pathSide: z.union([z.literal("left"), z.literal("center"), z.literal("right")]).optional(),

      rx: z.number().optional(),
      ry: z.number().optional(),

      fontFamily: z.string().optional(),
      fontSize: z.number().optional(),
      fontStyle: z.union([z.literal("normal"), z.literal("italic"), z.literal("oblique")]).optional(),
      fontWeight: z.union([z.literal("normal"), z.literal("bold"), z.literal("lighter"), z.literal("bolder")]).optional(),
      text: z.string().optional(),
      textAlign: z.union([z.literal("left"), z.literal("center"), z.literal("right")]).optional(),
      textDecorationThickness: z.number().optional(),
      underline: z.boolean().optional()
    })
  )
});
