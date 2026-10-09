"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/primitives";
import { isValidEmail } from "@/lib/utils/cn";

export function ContactForm({ contactEmail }: { contactEmail: string | null }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        const data = new FormData(event.currentTarget);
        const name = String(data.get("name") ?? "").trim();
        const email = String(data.get("email") ?? "").trim();
        const body = String(data.get("message") ?? "").trim();
        if (name.length < 2) {
          setError("Please enter your name.");
          return;
        }
        if (!isValidEmail(email)) {
          setError("Enter a valid email address.");
          return;
        }
        if (body.length < 10) {
          setError("Please write a little more detail.");
          return;
        }

        setPending(true);
        const composed = `Name: ${name}\nEmail: ${email}\n\n${body}`;
        if (contactEmail) {
          const subject = encodeURIComponent(`NoorHub message from ${name}`);
          const mailBody = encodeURIComponent(composed);
          window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${mailBody}`;
          setMessage("Your mail app has been opened. Send the email there to complete delivery.");
        } else {
          try {
            await navigator.clipboard.writeText(composed);
            setMessage(
              "Message copied to your clipboard. Contact delivery is not configured, so nothing was sent or stored.",
            );
          } catch {
            setError(
              "Contact delivery is not configured and this browser could not copy the message. Nothing was sent.",
            );
          }
        }
        setPending(false);
      }}
    >
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

      {error ? (
        <p role="alert" className="text-[0.8125rem] text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-[0.875rem] text-emerald-ink dark:text-sage-soft">
          {message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Preparing…" : contactEmail ? "Open mail app" : "Copy message"}
      </Button>
    </form>
  );
}
