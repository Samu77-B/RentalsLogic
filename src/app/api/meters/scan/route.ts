import { generateText, Output } from "ai";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";

const scanSchema = z.object({
  readingType: z
    .enum(["ELECTRIC", "GAS", "WATER"])
    .describe("Utility meter type inferred from labels, dials, or context"),
  readingValue: z
    .number()
    .describe("The numeric meter reading shown on the display or dials"),
  confidence: z
    .enum(["high", "medium", "low"])
    .describe("How confident the model is in the extracted reading"),
  notes: z
    .string()
    .optional()
    .describe("Brief note if the reading was hard to read"),
});

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

    if (!imageUrl) {
      return jsonError("imageUrl is required", 400);
    }

    const { output } = await generateText({
      model: "google/gemini-2.5-flash",
      instructions:
        "You read utility meters from photos for UK landlords. Identify whether the meter is ELECTRIC, GAS, or WATER, and extract the main cumulative reading number. Prefer the largest numeric display. Ignore serial numbers, barcodes, and dates. If dials are used, read them left to right. Return only the structured fields.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Scan this meter photo. Detect the meter type and the current reading value.",
            },
            {
              type: "file",
              mediaType: "image",
              data: imageUrl,
            },
          ],
        },
      ],
      output: Output.object({
        schema: scanSchema,
        name: "MeterReadingScan",
        description: "Meter type and reading extracted from a photo",
      }),
    });

    if (!output) {
      return jsonError("Could not read the meter from this photo", 422);
    }

    return jsonOk(output);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to scan meter photo";
    console.error("Meter scan failed:", error);
    return jsonError(
      message === "Unauthorized"
        ? message
        : "Could not scan this meter photo. Enter the reading manually.",
      message === "Unauthorized" ? 401 : 500
    );
  }
}
