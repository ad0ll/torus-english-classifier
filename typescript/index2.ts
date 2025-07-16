import type { SS58Address } from "@torus-network/sdk";
import { Agent } from "@torus-network/sdk/agent";
import { z } from "zod";

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

// Define a simple endpoint
agent.method(
  "hello",
  {
    input: z.object({
      name: z.string().min(1).max(50),
    }),
    output: {
      ok: {
        description: "Greeting response",
        schema: z.object({
          message: z.string(),
          timestamp: z.number(),
        }),
      },
      err: {
        description: "Error response",
        schema: z.object({
          error: z.string(),
        }),
      },
    },
  },
  async (input, context) => {
    console.log("hello");
    console.log(input);
    console.log(context);
    return {
      ok: {
        message: `Hello ${input.name}!`,
        timestamp: Date.now(),
      },
    };
  }
);

// Start the server
agent.run();
