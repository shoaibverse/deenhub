import type { Metadata } from "next";
import Link from "next/link";
import { Note, SectionHeading } from "@/components/ui/primitives";
import { DUA_COLLECTION, DUA_SOURCES } from "@/lib/dua/service";
import { HADITH_SOURCES } from "@/lib/hadith/service";
import { QURAN_SOURCES } from "@/lib/quran/service";
import { PRAYER_SOURCES } from "@/lib/prayer/service";
import { CALENDAR_SOURCES } from "@/lib/calendar/service";

export const metadata: Metadata = {
  title: "About",
  description:
    "What NoorHub is, why it exists, and exactly where its religious content comes from.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="About"
        title="A quiet place for the essentials"
        description="NoorHub brings the Quran, hadith, duas and a handful of practical tools into one place, without noise."
      />

      <div className="mt-10 space-y-10 text-[1rem] leading-[1.8]">
        <section>
          <h2 className="font-display text-xl">What NoorHub is</h2>
          <p className="mt-3">
            NoorHub is a reading and reference companion. It offers the Quran with a choice of
            translation and recitation, a hadith library organised by the collections’ own book
            sections, the supplications of Hisn al-Muslim, and tools for prayer times, qibla, the
            Hijri calendar, tasbeeh and zakat.
          </p>
          <p className="mt-3">
            It is deliberately restrained. There are no feeds, no streaks, and no counters comparing
            you with anyone else. What you read, save and count is yours.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Why it exists</h2>
          <p className="mt-3">
            Islamic resources are scattered across many sites of uneven quality. Some mix sourced
            text with invented wording; others bury a useful tool under advertising. NoorHub exists
            to do a small number of things properly, and to be honest about where every line of
            religious text comes from.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Content transparency</h2>
          <p className="mt-3">
            NoorHub does not write religious content. Every Quran text, translation, hadith and dua is
            loaded from an attributed source and displayed with its reference. If a source cannot be
            reached, the app says “Content unavailable” rather than substituting something else.
          </p>
          <p className="mt-3">
            Where the source records a grading or a book and hadith number, it is shown. Where the
            source records nothing, NoorHub shows nothing rather than guessing.
          </p>
        </section>

        <section id="sources">
          <h2 className="font-display text-xl">Sources</h2>
          <ul className="mt-4 space-y-4">
            <li className="surface rounded-[14px] p-5">
              <p className="font-display text-[1.0625rem]">Quran</p>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-mute">
                Uthmani text and translations from{" "}
                <a href={QURAN_SOURCES.url} className="link-quiet" rel="noreferrer noopener" target="_blank">
                  {QURAN_SOURCES.name}
                </a>{" "}
                ({QURAN_SOURCES.textSource}). Recitation audio from {QURAN_SOURCES.audio.provider}.
              </p>
            </li>
            <li className="surface rounded-[14px] p-5">
              <p className="font-display text-[1.0625rem]">Quran Tafseer · تفسیر</p>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-mute">
                Published Urdu and English Tafseer editions are loaded verbatim from the Quran
                Foundation Content API. NoorHub does not generate, translate, abridge or paraphrase
                commentary. Each passage shows its edition, author, ayah reference and direct source
                response. Some scholars explain a group of ayahs in one passage; NoorHub clearly
                marks that range.
              </p>
            </li>
            <li className="surface rounded-[14px] p-5">
              <p className="font-display text-[1.0625rem]">Hadith</p>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-mute">
                Arabic text and Urdu and English translations from the{" "}
                <a href={HADITH_SOURCES.url} className="link-quiet" rel="noreferrer noopener" target="_blank">
                  {HADITH_SOURCES.name.replace(" (fawazahmed0/hadith-api)", "")}
                </a>{" "}
                dataset, which republishes the collections with their book and hadith numbering.
                {HADITH_SOURCES.note}
              </p>
            </li>
            <li className="surface rounded-[14px] p-5">
              <p className="font-display text-[1.0625rem]">Duas</p>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-mute">
                {DUA_COLLECTION.title} by {DUA_SOURCES.author} — {DUA_COLLECTION.entryCount} entries
                with Arabic, transliteration, translation and recitation, from the{" "}
                <a href={DUA_SOURCES.url} className="link-quiet" rel="noreferrer noopener" target="_blank">
                  OpenDua
                </a>{" "}
                edition (data v{DUA_SOURCES.name.match(/v([\d.]+)/)?.[1] ?? "-"}).
              </p>
            </li>
            <li className="surface rounded-[14px] p-5">
              <p className="font-display text-[1.0625rem]">Prayer times and qibla</p>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-mute">
                Calculated on your device with{" "}
                <a href={PRAYER_SOURCES.url} className="link-quiet" rel="noreferrer noopener" target="_blank">
                  adhan-js
                </a>
                . {PRAYER_SOURCES.note}
              </p>
            </li>
            <li className="surface rounded-[14px] p-5">
              <p className="font-display text-[1.0625rem]">Hijri calendar</p>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-mute">
                {CALENDAR_SOURCES.name}. {CALENDAR_SOURCES.note}
              </p>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl">Design philosophy</h2>
          <p className="mt-3">
            The interface takes its cues from manuscripts and from the quiet of a mosque interior:
            warm paper, deep green, a little brass, generous margins and a serif for headings.
            Decoration is used sparingly — a single geometric lattice, one arch, hairline rules.
            Arabic is set in a Naskh face at a size you control, with line spacing that keeps it
            readable.
          </p>
          <p className="mt-3">
            NoorHub avoids dark patterns, artificial urgency and fabricated popularity. There are no
            testimonials, ratings or user counts on this site because none of them would be real.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Accessibility</h2>
          <p className="mt-3">
            The site is built with semantic HTML, keyboard navigation in mind, visible focus states
            and contrast-checked colour. Animations are short and subtle, and they switch themselves
            off when your system asks for reduced motion.
          </p>
        </section>

        <Note tone="gold">
          NoorHub is an educational and informational platform. It is not a substitute for qualified
          scholarly guidance.{" "}
          <Link href="/disclaimer" className="link-quiet">
            Read the full disclaimer
          </Link>
          .
        </Note>
      </div>
    </div>
  );
}
