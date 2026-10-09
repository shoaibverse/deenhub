import Link from "next/link";
import type { Ayah, SurahMeta, TafsirContent, TafsirResource } from "@/types";
import { Note } from "@/components/ui/primitives";
import { formatCoveredVerses, TAFSIR_SOURCE } from "@/lib/tafsir/service";

export function TafsirReader({
  surah,
  ayah,
  tafsir,
  resources,
  previous,
  next,
}: {
  surah: SurahMeta;
  ayah: Ayah;
  tafsir: TafsirContent;
  resources: TafsirResource[];
  previous: { surah: number; ayah: number; label: string } | null;
  next: { surah: number; ayah: number; label: string } | null;
}) {
  const coveredLabel = formatCoveredVerses(tafsir.coveredVerseKeys);
  const isGrouped = tafsir.coveredVerseKeys.length > 1;

  return (
    <div>
      <section className="surface rounded-[14px] p-5 sm:p-6">
        <form
          action={`/quran/${surah.number}/tafsir`}
          method="get"
          className="grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end"
        >
          <div>
            <label htmlFor="tafsir-edition" className="mb-1.5 block text-[0.8125rem] font-medium">
              Tafseer edition · تفسیر
            </label>
            <select
              id="tafsir-edition"
              name="edition"
              defaultValue={String(tafsir.resource.id)}
              className="h-11 w-full rounded-[10px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-3 text-[0.8125rem]"
            >
              <optgroup label="Urdu Tafseer · اردو تفاسیر">
                {resources
                  .filter((resource) => resource.language === "urdu")
                  .map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.displayName} — {resource.author}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="English Tafseer">
                {resources
                  .filter((resource) => resource.language === "english")
                  .map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.displayName} — {resource.author}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label htmlFor="tafsir-ayah" className="mb-1.5 block text-[0.8125rem] font-medium">
              Ayah · آیت
            </label>
            <select
              id="tafsir-ayah"
              name="ayah"
              defaultValue={String(ayah.numberInSurah)}
              className="h-11 w-full rounded-[10px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-3 text-[0.8125rem]"
            >
              {Array.from({ length: surah.numberOfAyahs }).map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  Ayah {index + 1}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="h-11 rounded-full bg-emerald-ink px-5 text-[0.875rem] font-medium text-ivory dark:bg-emerald-soft"
          >
            Read Tafseer
          </button>
        </form>
      </section>

      <article className="mt-6">
        <header className="text-center">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold">
            {surah.englishName} · {surah.number}:{ayah.numberInSurah}
          </p>
          <h1 className="mt-3 font-display text-[1.75rem] leading-snug">
            {tafsir.resource.displayName}
          </h1>
          <p className="mt-1 text-[0.8125rem] text-mute">
            {tafsir.resource.author} · {TAFSIR_SOURCE.site}
          </p>
        </header>

        <section className="mt-8 border-y border-[color:var(--line)] py-7">
          <p
            className="font-arabic text-right text-[1.75rem] leading-[2.2] text-emerald-ink dark:text-sage-soft"
            lang="ar"
            dir="rtl"
          >
            {ayah.arabic}
            <span className="ayah-number ms-2 inline-flex items-center justify-center rounded-full border border-gold/40 px-2 py-0.5 align-middle text-[0.6875rem]">
              {ayah.numberInSurah}
            </span>
          </p>
          {ayah.translation ? (
            <div className="mt-5 border-l-2 border-sage/40 pl-4">
              <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-gold">
                Urdu translation · اردو ترجمہ
              </p>
              <p className="font-urdu text-[1.0625rem] leading-[2.1]" lang="ur" dir="rtl">
                {ayah.translation}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-[0.875rem] text-mute">Translation unavailable.</p>
          )}
        </section>

        {isGrouped ? (
          <div className="mt-6">
            <Note tone="gold">
              This commentary discusses a group of ayahs together: {coveredLabel}. It is shown here
              in full because the selected scholar treated these verses as one passage. · یہ تفسیر
              آیات {coveredLabel} کو ایک ساتھ بیان کرتی ہے۔
            </Note>
          </div>
        ) : null}

        <section
          className={`tafsir-content surface mt-6 rounded-[14px] p-5 sm:p-8 ${
            tafsir.resource.language === "urdu" ? "font-urdu" : ""
          }`}
          lang={tafsir.resource.language === "urdu" ? "ur" : "en"}
          dir={tafsir.resource.direction}
          aria-label={`${tafsir.resource.name} commentary for ${tafsir.requestedVerseKey}`}
          dangerouslySetInnerHTML={{ __html: tafsir.html }}
        />

        <footer className="mt-6 space-y-4">
          <Note>
            Tafseer text is displayed verbatim from {TAFSIR_SOURCE.name}. NoorHub does not generate,
            translate, abridge or paraphrase it. {TAFSIR_SOURCE.note}
          </Note>
          <p className="text-[0.75rem] leading-relaxed text-mute">
            Edition: {tafsir.resource.displayName} · Author: {tafsir.resource.author} · Reference:{" "}
            {tafsir.requestedVerseKey}.{" "}
            <a
              href={tafsir.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="link-quiet"
            >
              View source response
            </a>
          </p>
        </footer>
      </article>

      <nav
        aria-label="Tafseer verse navigation"
        className="mt-10 flex items-center justify-between gap-4 border-t border-[color:var(--line)] pt-6"
      >
        {previous ? (
          <Link
            href={`/quran/${previous.surah}/tafsir?ayah=${previous.ayah}&edition=${tafsir.resource.id}`}
            className="link-quiet text-[0.875rem]"
          >
            ← {previous.label}
          </Link>
        ) : (
          <span />
        )}
        <Link href={`/quran/${surah.number}#ayah-${ayah.numberInSurah}`} className="link-quiet text-[0.875rem]">
          Back to Quran · قرآن
        </Link>
        {next ? (
          <Link
            href={`/quran/${next.surah}/tafsir?ayah=${next.ayah}&edition=${tafsir.resource.id}`}
            className="link-quiet text-[0.875rem]"
          >
            {next.label} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
