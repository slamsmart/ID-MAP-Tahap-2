import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

const CONVEX_URL = process.env.CONVEX_URL ?? "https://fabulous-bison-818.convex.cloud";

// Set TEST_ACTOR_ID di env ke ID admin yang sudah ada di DB.
// Contoh: TEST_ACTOR_ID=k1234... npx tsx scripts/seed-test-project.ts
const ACTOR_ID = process.env.TEST_ACTOR_ID;

async function seedTestProject() {
  if (!ACTOR_ID) {
    throw new Error(
      "TEST_ACTOR_ID env var harus di-set ke admin _id (lihat tabel users di Convex dashboard)."
    );
  }
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log("Creating test project...");

  const projectId = await client.mutation(api.projects.create, {
    actorId: ACTOR_ID as Id<"users">,
    title: "Test Mangrove Project",
    location: "Pantai Test, Jakarta",
    province: "DKI Jakarta",
    image: "https://via.placeholder.com/400x300",
    co2Absorption: 100,
    area: 10,
    seedsPlanted: 500,
    description: "Test project for QRIS payment simulation",
  });

  console.log(`✓ Test project created: ${projectId}`);
  return projectId;
}

seedTestProject()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to seed:", err);
    process.exit(1);
  });
