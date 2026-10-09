import type { Metadata } from "next";
import Link from "next/link";
import { SurahIndex } from "@/components/quran/surah-index";
import { getJuzList, getSurahs, QURAN_SOURCES } from "@/lib/quran/service";
import { getSessionUser } from "@/lib/auth/session";
import { getQuranProgress } from "@/db/queries";
import { SectionHeading, Note } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Quran",
  description:
    "Read the Quran in Uthmani script with translations, recitation, bookmarks and reading progress.",
  alternates: { canonical: "/quran" },
};

export default async function QuranIndexPage() {
  const surahs = getSurahs();
  const juz = getJuzList();
  const user = await getSessionUser();
  const progress = user ? await getQuranProgress(user.id) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="The Quran"
        title="Read at your own pace"
        description="Uthmani script with a choice of translation and recitation. Your reading position is remembered when you are signed in."
        action={
          <Link href="/quran/search" className="link-quiet text-[0.875rem]">
            Search the Quran
          </Link>
        }
      />

      <div className="mt-8">
        <SurahIndex
          surahs={surahs}
          juz={juz}
          lastRead={
            progress?.lastRead
              ? {
                  surahNumber: progress.lastRead.surahNumber,
                  lastAyah: progress.lastRead.lastAyah,
                }
              : null
          }
        />
      </div>

      <div className="mt-10">
        <Note>
          Quran text and translations are provided by {QURAN_SOURCES.name} ({QURAN_SOURCES.textSource}).
          Recitation audio is streamed from {QURAN_SOURCES.audio.provider}. Tafseer is displayed
          verbatim from verified Quran Foundation editions, with the selected edition and author
          shown beside every passage.
        </Note>
      </div>
    </div>
  );
}
