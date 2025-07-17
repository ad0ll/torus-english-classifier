// This is a reference Torus SDK client for the English language classification service
import { AgentClient, Keypair } from "@torus-network/sdk/agent-client";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const TORUS_CLIENT_MNEMONIC = process.env.TORUS_CLIENT_MNEMONIC;

if (!TORUS_CLIENT_MNEMONIC) {
  throw new Error("TORUS_CLIENT_MNEMONIC is not set");
}

class EnglishDetectorClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = "http://localhost:3000") {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async isEnglish(text: string, defaultOnUndetermined?: boolean) {
    const response = await this.client.call({
      endpoint: "is-english",
      data: { text, defaultOnUndetermined },
    });

    if (response.success) {
      const data = response.data as { isEnglish: boolean };
      return {
        success: true,
        isEnglish: data.isEnglish,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || "Failed to check if text is English",
      };
    }
  }

  async isEnglishBatch(texts: string[], defaultOnUndetermined?: boolean) {
    const response = await this.client.call({
      endpoint: "is-english-batch",
      data: { texts, defaultOnUndetermined },
    });

    if (response.success) {
      const data = response.data as { text: string; isEnglish: boolean }[];
      return {
        success: true,
        results: data,
      };
    } else {
      return {
        success: false,
        error:
          response.error?.message || "Failed to batch check if text is English",
      };
    }
  }
}

// Example usage
async function main() {
  if (!TORUS_CLIENT_MNEMONIC) {
    throw new Error(
      "Please set TORUS_CLIENT_MNEMONIC in your .env file to run this example."
    );
  }

  const client = new EnglishDetectorClient(TORUS_CLIENT_MNEMONIC, BASE_URL);

  // Example 1: Check a single English sentence
  console.log('Running: isEnglish("Hello, how are you today?")');
  const response1 = await client.isEnglish("Hello, how are you today?");
  console.log("Response:", response1);
  console.log("---");

  // Example 2: Check a single non-English sentence
  console.log('Running: isEnglish("Bonjour, comment ça va?")');
  const response2 = await client.isEnglish("Bonjour, comment ça va?");
  console.log("Response:", response2);
  console.log("---");

  // Example 3: Batch check multiple sentences
  const texts = [
    "This is an English sentence.",
    "Ceci est une phrase en français.",
    "Torus is a decentralized network.",
    "Wie geht es Ihnen?",
  ];
  console.log(`Running: isEnglishBatch(${JSON.stringify(texts)})`);
  const response3 = await client.isEnglishBatch(texts);
  console.log("Response:", response3);
  console.log("---");

  // Example 4: Using defaultOnUndetermined
  const shortText = "ok";
  console.log(
    `Running: isEnglish("${shortText}", true) - expecting it to default to true`
  );
  const response4 = await client.isEnglish(shortText, true);
  console.log("Response:", response4);
  console.log("---");
}

main().catch((error) => {
  console.error("An error occurred:", error.message);
});
