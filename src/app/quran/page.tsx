import type { Metadata } from "next";
import Link from "next/link";
import { SurahIndex } from "@/components/quran/surah-index";
import { getJuzList, getSurahs, QURAN_SOURCES } from "@/lib/quran/service";
import { SectionHeading, Note } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Quran",
  description:
    "Read the Quran in Uthmani script with Urdu and English translations, recitation and full Tafseer.",
  alternates: { canonical: "/quran" },
};

export default function QuranIndexPage() {
  const surahs = getSurahs();
  const juz = getJuzList();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="The Quran"
        title="Read at your own pace"
        description="Uthmani script with Urdu and English translations, recitation, and full verified Tafseer for every ayah. Your reading position stays in this browser."
        action={
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/quran/1/tafsir?ayah=1" className="link-quiet text-[0.875rem] text-gold">
              Full Tafseer · مکمل تفسیر
            </Link>
            <Link href="/quran/search" className="link-quiet text-[0.875rem]">
              Search the Quran
            </Link>
          </div>
        }
      />

      <div className="mt-8">
        <SurahIndex surahs={surahs} juz={juz} lastRead={null} />
      </div>

      <div className="mt-10">
        <Note>
          Quran text and translations are provided by {QURAN_SOURCES.name} ({QURAN_SOURCES.textSource}).
          Recitation audio is streamed from {QURAN_SOURCES.audio.provider}. Tafseer is displayed
          verbatim from verified Quran Foundation editions. Personal reading data stays on this
          device; no database is used.
        </Note>
      </div>
    </div>
  );
}
