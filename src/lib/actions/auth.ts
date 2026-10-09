"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getSessionUser } from "@/lib/auth/session";
import { upsertPreferences } from "@/db/queries";
import { supabaseConfig, isSupabaseEnabled } from "@/lib/supabase/config";
import { isValidEmail } from "@/lib/utils/cn";

export type AuthState = { error: string | null; values?: { email?: string; name?: string } };

const EMAIL_REMEMBER_FIELD = "remember";

export async function signInAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  void EMAIL_REMEMBER_FIELD;

  if (!isValidEmail(email)) return { error: "Enter a valid email address.", values: { email } };
  if (password.length < 6) return { error: "Enter your password.", values: { email } };

  let userId: string | null = null;
  try {
    const rows = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    const profile = rows[0];
    if (!profile) return { error: "Email or password is incorrect.", values: { email } };
    const valid = await verifyPassword(password, profile.passwordHash);
    if (!valid) return { error: "Email or password is incorrect.", values: { email } };
    userId = profile.id;
    await db.update(profiles).set({ lastSeenAt: new Date() }).where(eq(profiles.id, profile.id));
  } catch {
    return { error: "We could not sign you in right now. Please try again.", values: { email } };
  }

  await createSession(userId);
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signUpAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (name.length < 2) return { error: "Please enter your name.", values: { email, name } };
  if (!isValidEmail(email)) return { error: "Enter a valid email address.", values: { email, name } };
  if (password.length < 8)
    return { error: "Use at least 8 characters for your password.", values: { email, name } };
  if (password !== confirm)
    return { error: "The two passwords do not match.", values: { email, name } };

  let userId: string | null = null;
  try {
    const existing = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);
    if (existing.length > 0)
      return { error: "An account with this email already exists.", values: { email, name } };

    const inserted = await db
      .insert(profiles)
      .values({
        email,
        displayName: name,
        passwordHash: await hashPassword(password),
        authProvider: "password",
      })
      .returning({ id: profiles.id });
    userId = inserted[0]?.id ?? null;
  } catch {
    return { error: "We could not create your account right now. Please try again.", values: { email, name } };
  }

  if (!userId) return { error: "We could not create your account right now.", values: { email, name } };

  await upsertPreferences(userId, {});
  await createSession(userId);
  redirect("/dashboard");
}

export async function signOutAction() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Exchanges a Supabase access token (obtained in the browser after an OAuth
 * flow) for a NoorHub session. Only used when Supabase is configured.
 */
export async function signInWithSupabaseToken(token: string) {
  if (!isSupabaseEnabled()) return { error: "Supabase is not configured." };
  try {
    const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user?.email) return { error: "We could not verify that sign-in." };

    const email = data.user.email.toLowerCase();
    const rows = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    let userId = rows[0]?.id ?? null;
    if (!userId) {
      const inserted = await db
        .insert(profiles)
        .values({
          email,
          displayName: (data.user.user_metadata?.full_name as string | undefined) ?? null,
          authProvider: data.user.app_metadata?.provider ?? "supabase",
        })
        .returning({ id: profiles.id });
      userId = inserted[0]?.id ?? null;
      if (userId) await upsertPreferences(userId, {});
    }
    if (!userId) return { error: "We could not complete that sign-in." };
    await createSession(userId);
    return { error: null };
  } catch {
    return { error: "We could not complete that sign-in." };
  }
}

export async function updateAccountAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in again." };
  const name = String(formData.get("displayName") ?? "").trim();
  if (name.length < 2) return { error: "Please enter a name with at least 2 characters." };
  await db.update(profiles).set({ displayName: name }).where(eq(profiles.id, user.id));
  revalidatePath("/settings");
  return { error: null };
}
