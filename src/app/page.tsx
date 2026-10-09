import type { Metadata } from "next";
import Link from "next/link";
import { DailyOverview } from "@/components/home/daily-overview";
import { DuaCard } from "@/components/duas/dua-card";
import { ButtonLink } from "@/components/ui/button";
import { Hairline, Note, SectionHeading } from "@/components/ui/primitives";
import { Bilingual } from "@/components/ui/bilingual";
import { Reveal } from "@/components/ui/motion";
import {
  BeadsIcon,
  BookIcon,
  CalculatorIcon,
  CalendarIcon,
  CompassIcon,
  HeartIcon,
  StarIcon,
} from "@/components/ui/icons";
import { getCategories, getDuaOfTheDay, DUA_COLLECTION } from "@/lib/dua/service";
import { getCollections } from "@/lib/hadith/service";
import { getSurahs } from "@/lib/quran/service";
import { ur } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "NoorHub — Reconnect With Your Deen",
  description:
    "Read the Quran, study authentic hadith, remember Allah with duas from Hisn al-Muslim, and keep prayer times, qibla, calendar, tasbeeh and zakat tools close.",
  alternates: { canonical: "/" },
};

const TOOLS = [
  {
    href: "/prayer",
    title: "Prayer times · اوقاتِ نماز",
    description:
      "Times calculated on your device from your chosen method and location. Nothing is uploaded.",
    icon: CalendarIcon,
  },
  {
    href: "/qibla",
    title: "Qibla finder · قبلہ",
    description: "Compass direction to the Kaaba, with the distance from where you stand.",
    icon: CompassIcon,
  },
  {
    href: "/calendar",
    title: "Islamic calendar · اسلامی کیلنڈر",
    description: "Hijri and Gregorian side by side, with the notable dates of the year.",
    icon: CalendarIcon,
  },
  {
    href: "/tasbeeh",
    title: "Digital tasbeeh · تسبیح",
    description: "A quiet counter for your dhikr, with your own targets and history.",
    icon: BeadsIcon,
  },
  {
    href: "/zakat",
    title: "Zakat calculator · زکوٰۃ کیلکولیٹر",
    description:
      "Work through your assets and liabilities with a current nisab estimate.",
    icon: CalculatorIcon,
  },
  {
    href: "/about",
    title: "About · مصادر",
    description:
      "Where every Quran text, hadith and dua comes from, with sources and references.",
    icon: HeartIcon,
  },
];

export default async function HomePage() {
  const duaOfDay = getDuaOfTheDay(new Date());
  const surahs = getSurahs();
  const hadithCollections = getCollections();
  const duaCategories = getCategories();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pattern-girih pattern-fade pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-[0.16] dark:opacity-[0.1]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-24">
          <div>
            <p className="text-[0.75rem] font-semibold tracking-[0.2em] text-gold">
              <Bilingual value={ur.home.greeting} />
            </p>
            <h1 className="mt-5 font-display text-[2.5rem] leading-[1.4] sm:text-[3rem]">
              {ur.home.heading}
            </h1>
            <p className="mt-2 font-display text-[1.375rem] leading-loose text-mute">
              {ur.home.headingUr}
            </p>
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-loose text-mute">
              {ur.home.description}
            </p>
            <p className="mt-2 max-w-xl text-[0.9375rem] leading-loose text-mute">
              {ur.home.descriptionUr}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/quran" size="lg">
                <Bilingual value={ur.home.exploreQuran} />
              </ButtonLink>
              <ButtonLink href="/duas" variant="secondary" size="lg">
                <Bilingual value={ur.home.todaysDuas} />
              </ButtonLink>
            </div>
            <p className="mt-8 max-w-md text-[0.9375rem] leading-loose text-mute">
              {ur.brandSubline}
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="arch-top relative overflow-hidden border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-6 pb-10 pt-14 shadow-[0_24px_60px_-40px_rgba(13,59,46,0.5)]">
              <div className="pattern-girih absolute inset-0 opacity-[0.13] dark:opacity-[0.09]" />
              <svg
                viewBox="0 0 220 240"
                className="relative mx-auto h-56 w-full text-emerald-ink dark:text-sage"
                aria-hidden="true"
              >
                <path
                  d="M110 8c-46 0-78 34-78 82v142h156V90c0-48-32-82-78-82Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  opacity="0.55"
                />
                <path
                  d="M110 34c-32 0-54 24-54 60v138h108V94c0-36-22-60-54-60Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  opacity="0.35"
                />
                <path
                  d="M110 62 128 86l28-5-6 28 18 22-18 22 6 28-28-5-18 24-18-24-28 5 6-28-18-22 18-22-6-28 28 5Z"
                  fill="none"
                  stroke="#a5813a"
                  strokeWidth="1"
                  opacity="0.75"
                />
                <circle cx="110" cy="132" r="16" fill="none" stroke="#a5813a" strokeWidth="1" opacity="0.6" />
                <circle cx="110" cy="132" r="4" fill="#a5813a" opacity="0.8" />
              </svg>
              <p className="relative mt-6 text-center font-display text-[1.0625rem] text-mute">
                Noor · نور
              </p>
            </div>
          </div>
        </div>
      </section>

      <DailyOverview />

      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={ur.home.duaOfDay}
            title={ur.home.duaOfDayTitle}
            description={`Drawn in order from ${DUA_COLLECTION.title} — the same entry is shown to everyone on the same day.`}
            action={
              <Link href="/duas" className="link-quiet text-[0.9375rem]">
                {ur.home.browseAll}
              </Link>
            }
          />
          <div className="mt-6">
            <DuaCard entry={duaOfDay} signedIn={false} favorited={false} />
          </div>
        </Reveal>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Hairline />
      </div>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={ur.home.library}
            title={ur.home.libraryTitle}
            description={ur.home.libraryDescription}
          />
        </Reveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Reveal delay={0.05}>
            <article className="surface flex h-full flex-col rounded-[14px] p-6">
              <BookIcon className="text-sage" />
              <h3 className="mt-4 font-display text-xl">
                <Bilingual value={ur.nav.quran} />
              </h3>
              <p className="mt-2 flex-1 text-[0.9375rem] leading-loose text-mute">
                {ur.home.quranCard} ({surahs.length} surahs · سورتیں)
              </p>
              <Link href="/quran" className="link-quiet mt-5 text-[0.9375rem]">
                {ur.home.openQuran}
              </Link>
            </article>
          </Reveal>

          <Reveal delay={0.1}>
            <article className="surface flex h-full flex-col rounded-[14px] p-6">
              <StarIcon className="text-sage" />
              <h3 className="mt-4 font-display text-xl">
                <Bilingual value={ur.nav.hadith} />
              </h3>
              <p className="mt-2 flex-1 text-[0.9375rem] leading-loose text-mute">
                {ur.home.hadithCard}
              </p>
              <p className="mt-4 flex flex-wrap gap-1.5">
                {hadithCollections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/hadith/${collection.id}`}
                    className="rounded-full border border-[color:var(--line)] px-2.5 py-1 text-[0.75rem] text-mute hover:border-emerald/40 hover:text-[color:var(--fg)]"
                  >
                    {collection.name}
                  </Link>
                ))}
              </p>
              <Link href="/hadith" className="link-quiet mt-5 text-[0.9375rem]">
                {ur.home.enterLibrary}
              </Link>
            </article>
          </Reveal>

          <Reveal delay={0.15}>
            <article className="surface flex h-full flex-col rounded-[14px] p-6">
              <HeartIcon className="text-sage" />
              <h3 className="mt-4 font-display text-xl">
                <Bilingual value={ur.nav.duas} />
              </h3>
              <p className="mt-2 flex-1 text-[0.9375rem] leading-loose text-mute">
                {DUA_COLLECTION.entryCount} supplications from {DUA_COLLECTION.title} with{" "}
                {ur.home.duasCard}
              </p>
              <p className="mt-4 text-[0.8125rem] text-mute">
                {duaCategories.length} categories · {ur.home.categories} / زمرے
              </p>
              <Link href="/duas" className="link-quiet mt-5 text-[0.9375rem]">
                {ur.home.browseDuas}
              </Link>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={ur.home.dailyTools}
            title={ur.home.dailyToolsTitle}
            description={ur.home.dailyToolsDescription}
          />
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Reveal key={tool.href} delay={index * 0.04}>
                <Link
                  href={tool.href}
                  className="surface flex h-full flex-col rounded-[14px] p-5 transition-colors hover:border-emerald/40"
                >
                  <Icon className="text-sage" />
                  <h3 className="mt-3.5 font-display text-[1.0625rem]">{tool.title}</h3>
                  <p className="mt-1.5 text-[0.875rem] leading-loose text-mute">
                    {tool.description}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pt-20 sm:px-6 lg:px-8">
        <Reveal>
          <Note tone="gold">
            {ur.footer.note}{" "}
            <Link href="/about#sources" className="link-quiet">
              Read about our sources
            </Link>
            . ·{" "}
            <Link href="/disclaimer" className="link-quiet">
              دستبرداری
            </Link>
          </Note>
        </Reveal>
      </section>
    </>
  );
}
