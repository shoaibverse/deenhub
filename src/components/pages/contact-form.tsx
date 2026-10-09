"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/primitives";
import { sendContactMessage } from "@/lib/actions/library";

type State = { error: string | null; ok: boolean };

export function ContactForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(sendContactMessage, {
    error: null,
    ok: false,
  });

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field label="Name" htmlFor="contact-name">
        <input
          id="contact-name"
          name="name"
          required
          autoComplete="name"
          className={inputClass}
          placeholder="Your name"
        />
      </Field>
      <Field label="Email" htmlFor="contact-email">
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Message" htmlFor="contact-message" hint="Please include any reference numbers.">
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          rows={6}
          className={inputClass}
          placeholder="How can we help?"
        />
      </Field>

      {state.error ? (
        <p role="alert" className="text-[0.8125rem] text-red-700 dark:text-red-300">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-[0.875rem] text-emerald-ink dark:text-sage-soft">
          Thank you. Your message has been received.
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
