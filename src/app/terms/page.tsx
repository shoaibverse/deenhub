import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms on which NoorHub is made available.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Terms"
        title="Terms of use"
        description="Short, readable terms for using NoorHub."
      />

      <div className="mt-10 space-y-10 text-[1rem] leading-[1.8]">
        <section>
          <h2 className="font-display text-xl">The service</h2>
          <p className="mt-3">
            NoorHub is provided free of charge as an educational and informational resource for
            Islamic reading and reference. It may change or be withdrawn at any time.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Your account</h2>
          <p className="mt-3">
            You are responsible for keeping your password safe and for what happens through your
            account. Do not use NoorHub in a way that breaks the law or the rights of others.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Content and accuracy</h2>
          <p className="mt-3">
            NoorHub displays religious text from attributed third-party sources. Reasonable care is
            taken to display it faithfully, including its reference, but NoorHub does not control
            those sources and cannot guarantee that every entry is free of error. Where a source is
            unavailable, the app says so instead of showing substitute content.
          </p>
          <p className="mt-3">
            You should verify anything that matters with the original source and, for matters of
            ruling, with a qualified scholar. See the{" "}
            <Link href="/disclaimer" className="link-quiet">
              disclaimer
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Third-party content</h2>
          <p className="mt-3">
            Quran text, translations, recitation audio, hadith collections, dua text and metal prices
            belong to their respective providers and are used under their terms. Each is credited on
            the{" "}
            <Link href="/about#sources" className="link-quiet">
              About page
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Liability</h2>
          <p className="mt-3">
            NoorHub is provided “as is”, without warranty of any kind. To the extent permitted by
            law, NoorHub is not liable for any loss arising from use of the site, including decisions
            taken on the basis of prayer times, calendar dates or a zakat estimate.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Changes</h2>
          <p className="mt-3">
            These terms may be updated. Continued use after a change means you accept the updated
            terms.
          </p>
        </section>
      </div>
    </div>
  );
}
