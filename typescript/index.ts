import type { SS58Address } from "@torus-network/sdk";
import { Agent } from "@torus-network/sdk/agent";
import { franc } from "franc-min";
import { z } from "zod";
import logger from "./logger";

// Constants
const MIN_CONFIDENCE = 0.7;
const MIN_TEXT_LENGTH = 5;

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
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
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
    logger.debug(
      { defaultOnUndetermined },
      "Language detection: Empty text after cleaning"
    );
    return getUncertainResult(defaultOnUndetermined);
  }

  // Check if text is too short
  if (cleanedText.length < MIN_TEXT_LENGTH) {
    logger.debug(
      {
        textLength: cleanedText.length,
        defaultOnUndetermined,
      },
      `Language detection: Text too short`
    );
    return getUncertainResult(defaultOnUndetermined);
  }

  // Use franc to get the most probable language
  const detectedLanguage = franc(cleanedText);

  // If franc couldn't determine the language
  if (detectedLanguage === "und") {
    logger.debug(
      { defaultOnUndetermined },
      "Language detection: Franc returned undetermined"
    );
    return getUncertainResult(defaultOnUndetermined);
  }

  // Check if the detected language is English
  const isEnglish = detectedLanguage === "eng";
  logger.debug({ detectedLanguage, isEnglish }, "Language detection result");

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

const ErrorSchema = z.object({
  error: z.string(),
});

const IsEnglishBatchSchema = z.object({
  texts: z.array(z.string()).describe("The texts to be analyzed."),
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

// Agent
const agent = new Agent({
  agentKey: "5DwEqYekMJV9C1hU4hk16bzhtGHbvbkMxJK5rNVFsAu5NwAD" as SS58Address, // Your agent's SS58 address
  port: 3000,
  docs: {
    info: {
      title: "English Detector",
      version: "1.0.0",
    },
  },
});

agent.method(
  "is-english",
  {
    input: IsEnglishSchema,
    output: {
      ok: {
        description: "Whether the text is English.",
        schema: IsEnglishResponseSchema,
      },
      err: {
        description: "Error response",
        schema: ErrorSchema,
      },
    },
  },
  async (input) => {
    logger.info({ input }, "is-english request received");
    const validated = IsEnglishSchema.safeParse(input);
    if (!validated.success) {
      return { err: { error: validated.error.toString() } };
    }
    const { text, defaultOnUndetermined } = validated.data;
    const result = detectLanguage(text, defaultOnUndetermined);
    const validatedResponse = IsEnglishResponseSchema.parse(result);
    logger.info({ input, result }, "is-english request processed");
    return { ok: validatedResponse };
  }
);

agent.method(
  "is-english-batch",
  {
    input: IsEnglishBatchSchema,
    output: {
      ok: {
        description: "Array of results for whether each text is English.",
        schema: IsEnglishBatchResponseSchema,
      },
      err: {
        description: "Error response",
        schema: ErrorSchema,
      },
    },
  },
  async (input) => {
    logger.info({ input }, "is-english-batch request received");
    const validated = IsEnglishBatchSchema.safeParse(input);
    if (!validated.success) {
      return { err: { error: validated.error.toString() } };
    }
    const { texts, defaultOnUndetermined } = validated.data;
    const results = texts.map((text) => {
      const result = detectLanguage(text, defaultOnUndetermined);
      return {
        text,
        ...result,
      };
    });
    const validatedResponse = IsEnglishBatchResponseSchema.parse(results);
    logger.info({ input, results }, "is-english-batch request processed");
    return { ok: validatedResponse };
  }
);

// Start the server
agent.run();
