
import { z } from 'zod';

// --- Basic Types ---
export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const SizeSchema = z.object({
  width: z.number(),
  height: z.number(),
});

// --- Settings ---
export const PrintSettingsSchema = z.object({
  dpi: z.number().default(300),
  bleed: z.number().default(0.125), // inches
  pageSize: z.enum(['Letter', 'A4', 'Legal']).default('Letter'),
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  margins: z.object({
    top: z.number(),
    bottom: z.number(),
    left: z.number(),
    right: z.number(),
  }).default({ top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 }),
});

// --- Canvas Objects ---
// We'll extend this as we add more tools (Text, Image, etc.)
export const CanvasObjectSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['rect', 'circle', 'text', 'image', 'group']),
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  angle: z.number().optional(),
  opacity: z.number().optional(),
  scaleX: z.number().optional(),
  scaleY: z.number().optional(),
  // For text
  text: z.string().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  // For images
  src: z.string().optional(),
  crop: z.object({
       x: z.number(),
       y: z.number(),
       width: z.number(),
       height: z.number()
  }).optional()
});

export const PhotoGridConfigSchema = z.object({
    rows: z.number().default(2),
    columns: z.number().default(2),
    gap: z.number().default(10),
    images: z.array(z.string().url()).optional() // Array of image URLs occupying the grid
});


export const PrintCanvasStateSchema = z.object({
  version: z.string(),
  settings: PrintSettingsSchema,
  objects: z.array(CanvasObjectSchema),
  // New: Grid definitions
  grids: z.array(PhotoGridConfigSchema).optional()
});

export type PrintCanvasState = z.infer<typeof PrintCanvasStateSchema>;
export type CanvasObject = z.infer<typeof CanvasObjectSchema>;
export type PrintSettings = z.infer<typeof PrintSettingsSchema>;
