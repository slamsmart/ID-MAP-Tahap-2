import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { clearServerSession, getServerSession } from "@/lib/serverSession";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
export const dynamic = "force-dynamic";

export async function GET() {
  const session = getServerSession();
  if (!session) return NextResponse.json({ user: null });

  try {
    const user = await convex.query(api.users.get, {
      userId: session.uid as Id<"users">,
    });
    if (!user) {
      clearServerSession();
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch {
    clearServerSession();
    return NextResponse.json({ user: null });
  }
}
