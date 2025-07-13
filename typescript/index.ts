import { zValidator } from "@hono/zod-validator";
import { franc } from "franc-min";
import { Hono } from "hono";
import { z } from "zod";

// Constants
const MIN_CONFIDENCE = 0.7;
const MIN_TEXT_LENGTH = 10;

// Helper function for uncertain results
function getUncertainResult(defaultOnUndetermined: boolean) {
  return {
    isEnglish: defaultOnUndetermined,
  };
}

// Text cleaning function
function cleanText(text: string): string {
  const cleaned = text
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, "")
    // Remove mentions (@username)
    .replace(/@\w+/g, "")
    // Remove hashtags (#hashtag)
    .replace(/#\w+/g, "")
    // Remove emojis (basic pattern - covers most common emojis)
    .replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      ""
    )
    // Remove punctuation (keep letters, numbers, and spaces)
    .replace(/[^\w\s]/g, " ")
    // Replace multiple spaces with single space
    .replace(/\s+/g, " ")
    // Trim whitespace
    .trim();

  return cleaned;
}

// Language detection function
function detectLanguage(
  text: string,
  defaultOnUndetermined: boolean = false
): { isEnglish: boolean } {
  const cleanedText = cleanText(text);

  // Check if text is empty after cleaning
  if (cleanedText.length === 0) {
    console.log(
      "Language detection: Empty text after cleaning, using defaultOnUndetermined:",
      defaultOnUndetermined
    );
    return getUncertainResult(defaultOnUndetermined);
  }

  // Check if text is too short
  if (cleanedText.length < MIN_TEXT_LENGTH) {
    console.log(
      `Language detection: Text too short (${cleanedText.length} chars), using defaultOnUndetermined:`,
      defaultOnUndetermined
    );
    return getUncertainResult(defaultOnUndetermined);
  }

  // Use franc to get the most probable language
  const detectedLanguage = franc(cleanedText);

  // If franc couldn't determine the language
  if (detectedLanguage === "und") {
    console.log(
      "Language detection: Franc returned undetermined, using defaultOnUndetermined:",
      defaultOnUndetermined
    );
    return getUncertainResult(defaultOnUndetermined);
  }

  // Check if the detected language is English
  const isEnglish = detectedLanguage === "eng";
  console.log(
    `Language detection: Detected ${detectedLanguage} -> isEnglish: ${isEnglish}`
  );

  return {
    isEnglish,
  };
}

// Input schemas
const IsEnglishSchema = z.object({
  text: z.string().describe("The text to be analyzed."),
  detectionMethods: z
    .array(z.enum(["franc"]))
    .default(["franc"])
    .describe("The detection methods to use."),
  defaultOnUndetermined: z
    .boolean()
    .default(false)
    .describe(
      "When true, if the outcome of language detection is 'uncertain', it will return 'yes'."
    ),
});

// Response schemas
const IsEnglishResponseSchema = z.object({
  isEnglish: z.boolean().describe("Whether the text is English."),
});

const IsEnglishBatchSchema = z.object({
  texts: z.array(IsEnglishSchema),
  detectionMethods: z
    .array(z.enum(["franc"]))
    .default(["franc"])
    .describe("The detection methods to use."),
  defaultOnUndetermined: z
    .boolean()
    .default(false)
    .describe(
      "When true, if the outcome of language detection is 'uncertain', it will return 'yes'."
    ),
});

const IsEnglishBatchResponseSchema = z.array(
  z.object({
    text: z.string().describe("The original text that was analyzed."),
    isEnglish: z.boolean().describe("Whether the text is English."),
  })
);

const app = new Hono();

app.post("/is-english", zValidator("json", IsEnglishSchema), (c) => {
  const { text, defaultOnUndetermined } = c.req.valid("json");

  const result = detectLanguage(text, defaultOnUndetermined);

  // Validate response against schema
  const validatedResponse = IsEnglishResponseSchema.parse(result);
  return c.json(validatedResponse);
});

app.post("/is-english-batch", zValidator("json", IsEnglishBatchSchema), (c) => {
  const { texts, defaultOnUndetermined } = c.req.valid("json");

  const results = texts.map((item) => {
    const result = detectLanguage(item.text, defaultOnUndetermined);

    return {
      text: item.text,
      ...result,
    };
  });

  // Validate response against schema
  const validatedResponse = IsEnglishBatchResponseSchema.parse(results);
  return c.json(validatedResponse);
});

// Start the server
export default {
  port: 3000,
  fetch: app.fetch,
};
