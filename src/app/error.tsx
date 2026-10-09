"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
        Something went wrong
      </p>
      <h1 className="mt-4 font-display text-[2rem] leading-snug">
        We couldn’t load this page
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-mute">
        The page failed to render. This is a problem on our side, not something you did. You can try
        again, or return to the home page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-emerald-ink px-5 py-2.5 text-sm font-medium text-ivory dark:bg-emerald-soft"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-full border border-[color:var(--line)] px-5 py-2.5 text-sm"
        >
          Home page
        </a>
      </div>
    </div>
  );
}
