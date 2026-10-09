import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Amiri, Manrope, Newsreader, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { HeaderNav } from "@/components/navigation/header-nav";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { SiteFooter } from "@/components/navigation/site-footer";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
});

const urdu = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-urdu",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-amiri",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "نورہب — اپنے دین سے دوبارہ جڑیں",
    template: "%s · نورہب",
  },
  description:
    "قرآن، حدیث، دعائیں، اوقاتِ نماز اور اسلامی علم کے لیے ایک پُرسکون ڈیجیٹل ساتھی۔ (NoorHub — Reconnect With Your Deen)",
  applicationName: "NoorHub",
  keywords: [
    "قرآن",
    "حدیث",
    "دعا",
    "اوقاتِ نماز",
    "قبلہ",
    "اسلامی کیلنڈر",
    "تسبیح",
    "زکوٰۃ",
    "Quran",
    "Hadith",
    "Duas",
    "Prayer times",
  ],
  openGraph: {
    type: "website",
    title: "نورہب — اپنے دین سے دوبارہ جڑیں",
    description:
      "قرآن، حدیث، دعائیں، اوقاتِ نماز اور اسلامی علم کے لیے ایک پُرسکون ڈیجیٹل ساتھی۔",
    siteName: "NoorHub",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "نورہب — اپنے دین سے دوبارہ جڑیں",
    description: "قرآن، حدیث، دعائیں اور اوقاتِ نماز ایک جگہ۔",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1513" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Dark is the default theme. The user's stored choice always wins.
const themeScript = `(function(){try{var raw=localStorage.getItem('noorhub.preferences.v1');var theme=raw?JSON.parse(raw).theme:'dark';var dark=theme==='dark'||(theme==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${manrope.variable} ${newsreader.variable} ${urdu.variable} ${amiri.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="page-backdrop min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-emerald-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ivory"
        >
          Skip to content · مرکزی مواد پر جائیں
        </a>
        <PreferencesProvider>
          <HeaderNav />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <SiteFooter />
          <MobileTabBar />
        </PreferencesProvider>
      </body>
    </html>
  );
}
