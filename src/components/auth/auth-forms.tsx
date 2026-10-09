"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/primitives";
import { signInAction, signUpAction, type AuthState } from "@/lib/actions/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseEnabled } from "@/lib/supabase/config";

const initial: AuthState = { error: null };

function SubmitRow({ pending, label }: { pending: boolean; label: string }) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Please wait…" : label}
    </Button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initial);
  const [remember, setRemember] = useState(true);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const router = useRouter();
  const supabaseEnabled = isSupabaseEnabled();

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const { data } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        const response = await fetch("/api/auth/supabase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: session.access_token }),
        });
        if (response.ok) {
          router.push(next.startsWith("/") ? next : "/dashboard");
        } else {
          setOauthError("We could not complete that sign-in.");
        }
      }
    });
    return () => data.subscription.unsubscribe();
  }, [next, router]);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-5" noValidate>
        <input type="hidden" name="next" value={next} />
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.values?.email ?? ""}
            className={inputClass}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
            placeholder="Your password"
          />
        </Field>

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-[0.8125rem] text-mute">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="size-4 rounded border-[color:var(--line)] accent-emerald"
            />
            Remember me
          </label>
          <Link href="/contact" className="link-quiet text-[0.8125rem]">
            Forgot password?
          </Link>
        </div>

        {state.error ? (
          <p role="alert" className="text-[0.8125rem] text-red-700 dark:text-red-300">
            {state.error}
          </p>
        ) : null}

        <SubmitRow pending={pending} label="Sign In" />
      </form>

      {supabaseEnabled ? (
        <>
          <div className="flex items-center gap-3 text-[0.75rem] uppercase tracking-[0.14em] text-mute">
            <span className="h-px flex-1 bg-[color:var(--line)]" />
            or
            <span className="h-px flex-1 bg-[color:var(--line)]" />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={async () => {
              const client = getSupabaseBrowserClient();
              if (!client) {
                setOauthError("Google sign-in is not configured.");
                return;
              }
              const { error } = await client.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/login` },
              });
              if (error) setOauthError(error.message);
            }}
          >
            Continue with Google
          </Button>
          {oauthError ? (
            <p role="alert" className="text-[0.8125rem] text-red-700 dark:text-red-300">
              {oauthError}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field label="Name" htmlFor="name">
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          defaultValue={state.values?.name ?? ""}
          className={inputClass}
          placeholder="Your name"
        />
      </Field>
      <Field label="Email" htmlFor="register-email">
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ""}
          className={inputClass}
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Password" htmlFor="register-password" hint="At least 8 characters">
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
          placeholder="Create a password"
        />
      </Field>
      <Field label="Confirm password" htmlFor="register-confirm">
        <input
          id="register-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
          placeholder="Repeat your password"
        />
      </Field>

      {state.error ? (
        <p role="alert" className="text-[0.8125rem] text-red-700 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <SubmitRow pending={pending} label="Create account" />

      <p className="text-[0.75rem] leading-relaxed text-mute">
        Your account holds your bookmarks, reading progress, favourite duas and preferences. See the{" "}
        <Link href="/privacy" className="link-quiet">
          privacy page
        </Link>{" "}
        for exactly what is stored.
      </p>
    </form>
  );
}
