
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Supabase session exchange is unavailable because database-backed authentication is not configured.",
    },
    { status: 503 }
  );
}