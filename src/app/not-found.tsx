import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
        Page not found
      </p>
      <h1 className="mt-4 font-display text-[2rem] leading-snug">
        This page does not exist
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-mute">
        The address may have changed, or the link may be incomplete. NoorHub does not show substitute
        content in place of a missing page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-emerald-ink px-5 py-2.5 text-sm font-medium text-ivory dark:bg-emerald-soft"
        >
          Go to the home page
        </Link>
        <Link
          href="/quran"
          className="rounded-full border border-[color:var(--line)] px-5 py-2.5 text-sm"
        >
          Open the Quran
        </Link>
      </div>
    </div>
  );
}
