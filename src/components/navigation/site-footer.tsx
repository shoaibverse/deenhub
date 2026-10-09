import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { Bilingual } from "@/components/ui/bilingual";
import { ur } from "@/lib/i18n";

const COLUMNS: Array<{
  title: typeof ur.footer.read;
  links: Array<{ label: (typeof ur.nav)[keyof typeof ur.nav] | string; href: string }>;
}> = [
  {
    title: ur.footer.read,
    links: [
      { label: ur.nav.quran, href: "/quran" },
      { label: ur.nav.hadith, href: "/hadith" },
      { label: ur.nav.duas, href: "/duas" },
    ],
  },
  {
    title: ur.footer.daily,
    links: [
      { label: "Prayer times · اوقاتِ نماز", href: "/prayer" },
      { label: ur.tools.qibla, href: "/qibla" },
      { label: ur.tools.calendar, href: "/calendar" },
      { label: ur.tools.tasbeeh, href: "/tasbeeh" },
    ],
  },
  {
    title: ur.footer.tools,
    links: [{ label: ur.tools.zakat, href: "/zakat" }],
  },
  {
    title: ur.footer.about,
    links: [
      { label: ur.footer.aboutPage, href: "/about" },
      { label: ur.footer.contact, href: "/contact" },
      { label: ur.footer.privacy, href: "/privacy" },
      { label: ur.footer.terms, href: "/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[color:var(--line)] bg-[color:var(--surface-sunken)] pb-24 lg:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.6fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-[0.9375rem] leading-loose text-mute">
              {ur.brandSubline}
            </p>
            <p className="mt-6 max-w-md text-[0.8125rem] leading-loose text-mute">
              {ur.footer.note}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.title.en}>
                <p className="text-[0.75rem] font-semibold text-gold">
                  <Bilingual value={column.title} />
                </p>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="link-quiet text-[0.9375rem] text-mute">
                        {typeof link.label === "string" ? (
                          link.label
                        ) : (
                          <Bilingual value={link.label} />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[color:var(--line)] pt-6 text-[0.8125rem] text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            NoorHub · {ur.brandTagline} · {ur.brandTaglineUr} · Built by Shoaib Farooq
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/about#sources" className="link-quiet">
              <Bilingual value={ur.footer.sources} />
            </Link>
            <Link href="/disclaimer" className="link-quiet">
              <Bilingual value={ur.footer.disclaimer} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
