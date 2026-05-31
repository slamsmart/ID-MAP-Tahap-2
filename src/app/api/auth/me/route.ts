import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverSession";

export async function GET() {
  const session = getServerSession();
  if (!session) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      _id: session.uid,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}
