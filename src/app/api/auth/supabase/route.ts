import { NextResponse } from "next/server";
import { signInWithSupabaseToken } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

/**
 * Exchanges a Supabase access token for a NoorHub session cookie. Only used
 * when Supabase is configured; otherwise it reports that clearly.
 */
export async function POST(request: Request) {
  let token: string | undefined;
  try {
    const body = (await request.json()) as { token?: string };
    token = body.token;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const result = await signInWithSupabaseToken(token);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
