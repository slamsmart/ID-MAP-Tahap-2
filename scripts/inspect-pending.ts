import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function main() {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const amounts = [1142, 1211, 1121, 1133];
  for (const amount of amounts) {
    const rows = await client.query(api.contributions.debugRecentPending, { amount });
    console.log(JSON.stringify({ amount, count: rows.length, rows: rows.slice(0, 5) }, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
