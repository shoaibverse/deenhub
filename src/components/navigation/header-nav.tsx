"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Wordmark } from "@/components/brand/logo";
import { SearchDialog } from "./search-dialog";
import { ThemeToggle } from "./theme-toggle";
import { ChevronDownIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";
import { Bilingual } from "@/components/ui/bilingual";
import { cn } from "@/lib/utils/cn";
import { ur } from "@/lib/i18n";

const PRIMARY = [
  { label: ur.nav.quran, href: "/quran" },
  { label: ur.nav.hadith, href: "/hadith" },
  { label: ur.nav.duas, href: "/duas" },
  { label: ur.nav.prayer, href: "/prayer" },
];

const TOOLS = [
  { label: ur.tools.qibla, href: "/qibla" },
  { label: ur.tools.calendar, href: "/calendar" },
  { label: ur.tools.tasbeeh, href: "/tasbeeh" },
  { label: ur.tools.zakat, href: "/zakat" },
  { label: { en: "My hub" }, href: "/dashboard" },
  { label: ur.tools.bookmarks, href: "/bookmarks" },
  { label: { en: "Settings" }, href: "/settings" },
];

export function HeaderNav() {
  const pathname = usePathname();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setToolsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setToolsOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const toolsActive = TOOLS.some((tool) => isActive(tool.href));

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--surface)]/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="NoorHub — Home" className="shrink-0">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="ms-4 hidden items-center gap-1 lg:flex">
          {PRIMARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-[0.9375rem] transition-colors",
                isActive(item.href)
                  ? "bg-sand/80 text-emerald-ink dark:bg-night-soft dark:text-sage-soft"
                  : "text-[color:var(--fg)]/80 hover:bg-sand/60 dark:hover:bg-night-soft",
              )}
            >
              <Bilingual value={item.label} />
            </Link>
          ))}

          <div className="relative" ref={toolsRef}>
            <button
              type="button"
              onClick={() => setToolsOpen((value) => !value)}
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.9375rem] transition-colors",
                toolsActive
                  ? "bg-sand/80 text-emerald-ink dark:bg-night-soft dark:text-sage-soft"
                  : "text-[color:var(--fg)]/80 hover:bg-sand/60 dark:hover:bg-night-soft",
              )}
            >
              <Bilingual value={ur.nav.tools} />
              <ChevronDownIcon
                width={16}
                height={16}
                className={cn("transition-transform", toolsOpen && "rotate-180")}
              />
            </button>
            <AnimatePresence>
              {toolsOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="absolute start-0 top-[calc(100%+8px)] w-56 overflow-hidden rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] p-1.5 shadow-lg"
                >
                  {TOOLS.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="block rounded-[10px] px-3 py-2.5 transition-colors hover:bg-sand/70 dark:hover:bg-night-soft"
                    >
                      <Bilingual value={tool.label} />
                    </Link>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </nav>

        <div className="ms-auto flex items-center gap-1">
          <SearchDialog label={ur.nav.search.en} />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-sand/70 lg:hidden dark:hover:bg-night-soft"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-ink/40 dark:bg-black/70"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-label="Menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.24 }}
              className="absolute start-0 top-0 flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-[color:var(--surface)] p-6"
            >
              <div className="flex items-center justify-between">
                <Wordmark />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex size-10 items-center justify-center rounded-full hover:bg-sand/70 dark:hover:bg-night-soft"
                >
                  <CloseIcon />
                </button>
              </div>

              <nav aria-label="Mobile" className="mt-8 space-y-1">
                {PRIMARY.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-[10px] px-3 py-3 font-display text-lg hover:bg-sand/70 dark:hover:bg-night-soft"
                  >
                    <Bilingual value={item.label} />
                  </Link>
                ))}
              </nav>

              <p className="mt-6 px-3 text-[0.75rem] text-gold">
                <Bilingual value={ur.nav.tools} />
              </p>
              <nav aria-label="Tools" className="mt-2 space-y-1">
                {TOOLS.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="block rounded-[10px] px-3 py-2.5 text-[0.9375rem] hover:bg-sand/70 dark:hover:bg-night-soft"
                  >
                    <Bilingual value={tool.label} />
                  </Link>
                ))}
              </nav>

              <p className="mt-auto pt-8 text-[0.75rem] leading-loose text-mute">
                {ur.footer.note}
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
