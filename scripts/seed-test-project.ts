import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = "https://fabulous-bison-818.convex.cloud";

async function seedTestProject() {
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log("Creating test project...");

  const projectId = await client.mutation(api.projects.create, {
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
