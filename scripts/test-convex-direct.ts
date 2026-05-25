import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Test direct Convex call from Node (matching what the API route does)
const CONVEX_URL = "https://fabulous-bison-818.convex.cloud";

async function test() {
  console.log("Testing Convex from Node with URL:", CONVEX_URL);

  const convex = new ConvexHttpClient(CONVEX_URL);

  try {
    const id = await convex.mutation(api.contributions.createPending, {
      projectId: "jx742nd2q0vad2b35gecjztjz987cfsb" as any,
      amount: 50000,
      co2Equivalent: 10,
      paymentId: "node_test_" + Date.now(),
    });
    console.log("✓ Created contribution:", id);
  } catch (err) {
    console.error("✗ Error:", err);
  }
}

test();
