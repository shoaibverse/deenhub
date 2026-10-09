"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BeadsIcon,
  BookIcon,
  CalculatorIcon,
  CalendarIcon,
  CompassIcon,
  HeartIcon,
  HomeIcon,
} from "@/components/ui/icons";
import { Bilingual } from "@/components/ui/bilingual";
import { cn } from "@/lib/utils/cn";
import { SearchDialog } from "./search-dialog";
import { ur } from "@/lib/i18n";

const TABS = [
  { label: ur.nav.home, href: "/", icon: HomeIcon },
  { label: ur.nav.quran, href: "/quran", icon: BookIcon },
  { label: ur.nav.duas, href: "/duas", icon: HeartIcon },
  { label: ur.nav.prayer, href: "/prayer", icon: CalendarIcon },
];

const MORE = [
  { label: ur.nav.hadith, href: "/hadith" },
  { label: ur.tools.qibla, href: "/qibla" },
  { label: ur.tools.calendar, href: "/calendar" },
  { label: ur.tools.tasbeeh, href: "/tasbeeh" },
  { label: ur.tools.zakat, href: "/zakat" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-[color:var(--line)] bg-[color:var(--surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[3.25rem] flex-col items-center justify-center gap-1 py-2 text-[0.6875rem] font-medium transition-colors",
                  active ? "text-emerald-ink dark:text-sage-soft" : "text-mute",
                )}
              >
                <Icon width={20} height={20} />
                <Bilingual value={tab.label} />
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <details>
            <summary
              className={cn(
                "flex min-h-[3.25rem] cursor-pointer list-none flex-col items-center justify-center gap-1 py-2 text-[0.6875rem] font-medium",
                MORE.some((item) => isActive(item.href))
                  ? "text-emerald-ink dark:text-sage-soft"
                  : "text-mute",
              )}
            >
              <CompassIcon width={20} height={20} />
              <Bilingual value={ur.nav.more} />
            </summary>
            <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] p-1.5 shadow-lg">
              <div className="px-3 py-1.5">
                <SearchDialog label={ur.nav.search.en} />
              </div>
              {MORE.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-[10px] px-3 py-2.5 text-[0.9375rem] hover:bg-sand/70 dark:hover:bg-night-soft"
                >
                  <Bilingual value={item.label} />
                </Link>
              ))}
            </div>
          </details>
        </li>
      </ul>
    </nav>
  );
}

export const ToolIconPreview = () => (
  <div className="flex gap-2 text-sage">
    <BeadsIcon />
    <CalculatorIcon />
  </div>
);
