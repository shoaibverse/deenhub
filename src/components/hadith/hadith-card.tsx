"use client";

import { SaveBookmarkButton } from "@/components/duas/dua-card";
import { usePreferences } from "@/components/providers/preferences-provider";
import type { HadithItem } from "@/types";

export function HadithCard({
  hadith,
  signedIn,
  bookmarked,
}: {
  hadith: HadithItem;
  signedIn: boolean;
  bookmarked: boolean;
}) {
  const { preferences } = usePreferences();

  return (
    <article
      id={`hadith-${hadith.hadithNumber}`}
      className="surface scroll-mt-28 rounded-[14px] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[0.75rem] text-mute">
          {hadith.collectionName} · {hadith.sectionTitle} · Hadith {hadith.hadithNumber}
        </p>
        {hadith.grades.length > 0 ? (
          <p className="text-[0.6875rem] text-gold">
            {hadith.grades.map((grade) => `${grade.name}: ${grade.grade}`).join(" · ")}
          </p>
        ) : null}
      </div>

      <section className="mt-5" aria-labelledby={`${hadith.id}-arabic`}>
        <p
          id={`${hadith.id}-arabic`}
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold"
        >
          Arabic · عربی
        </p>
        {hadith.arabic ? (
          <p
            className="font-arabic mt-2"
            style={{ fontSize: `${Math.round(preferences.arabicFontSize * 0.78)}px` }}
            lang="ar"
            dir="rtl"
          >
            {hadith.arabic}
          </p>
        ) : (
          <p className="mt-2 text-[0.8125rem] italic text-mute">Arabic text unavailable.</p>
        )}
      </section>

      <section
        className="mt-6 border-r-2 border-gold/35 bg-gold-pale/10 px-4 py-3 dark:bg-gold/5"
        aria-labelledby={`${hadith.id}-urdu`}
      >
        <p
          id={`${hadith.id}-urdu`}
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold"
          dir="ltr"
        >
          Urdu translation · اردو ترجمہ
        </p>
        {hadith.urdu ? (
          <p
            className="font-urdu mt-2 text-right text-[1.0625rem] leading-[2.1]"
            lang="ur"
            dir="rtl"
          >
            {hadith.urdu}
          </p>
        ) : (
          <p className="mt-2 text-right text-[0.875rem] text-mute" lang="ur" dir="rtl">
            اردو ترجمہ دستیاب نہیں۔
          </p>
        )}
      </section>

      <section className="mt-6" aria-labelledby={`${hadith.id}-english`}>
        <p
          id={`${hadith.id}-english`}
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold"
        >
          English translation
        </p>
        <p className="mt-2 max-w-[62ch] text-[0.9375rem] leading-[1.85]" dir="ltr">
          {hadith.english}
        </p>
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--line)] pt-4">
        <p className="text-[0.75rem] text-mute">
          {hadith.reference}
        </p>
        <SaveBookmarkButton
          itemType="hadith"
          itemId={hadith.id}
          title={`${hadith.collectionName} ${hadith.hadithNumber}`}
          subtitle={hadith.sectionTitle}
          reference={hadith.reference}
          href={`/hadith/${hadith.collection}/${hadith.section}#hadith-${hadith.hadithNumber}`}
          snippet={(hadith.urdu ?? hadith.english).slice(0, 220)}
          saved={bookmarked}
          signedIn={signedIn}
        />
      </div>
    </article>
  );
}
