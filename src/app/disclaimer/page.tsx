import type { Metadata } from "next";
import Link from "next/link";
import { Note, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "NoorHub is an educational platform and is not a substitute for qualified scholarly guidance.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Disclaimer"
        title="Educational, not authoritative"
        description="What NoorHub can and cannot be relied upon for."
      />

      <div className="mt-10 space-y-10 text-[1rem] leading-[1.8]">
        <section>
          <h2 className="font-display text-xl">An educational platform</h2>
          <p className="mt-3">
            NoorHub is an educational and informational platform. It is not a mosque, a fatwa service
            or a body of scholars, and nothing on it should be read as a religious ruling.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Differences of scholarly opinion</h2>
          <p className="mt-3">
            Islamic rulings and practices differ according to methodology, region and circumstance.
            Prayer time conventions, the beginning of a Hijri month, the nisab standard for zakat and
            many other details are all areas of legitimate difference. Where NoorHub offers a choice,
            it does not present one option as the only correct one.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Ask a qualified scholar</h2>
          <p className="mt-3">
            For personal religious questions — zakat on your specific situation, prayer in difficult
            circumstances, or anything affecting a ruling — please consult a qualified scholar you
            trust. NoorHub cannot answer these questions, and the contact form is not a channel for
            them.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Accuracy, and its limits</h2>
          <p className="mt-3">
            Every text is taken from an attributed source and shown with its reference. NoorHub does
            not paraphrase, shorten or rewrite religious text, and it does not generate religious
            content. Even so, upstream data can contain errors, and a translation is an
            interpretation rather than the original. Where you find a mistake, please report it
            through the{" "}
            <Link href="/contact" className="link-quiet">
              contact form
            </Link>{" "}
            so it can be corrected.
          </p>
          <p className="mt-3">
            This disclaimer explains the limits of the platform. It is not an excuse for inaccurate
            content, and reported errors in religious text are treated as priority fixes.
          </p>
        </section>

        <Note tone="gold">
          Religious content is provided for educational and informational purposes. Verify matters of
          religious ruling with qualified scholars.
        </Note>
      </div>
    </div>
  );
}
