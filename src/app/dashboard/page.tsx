import type { Metadata } from "next";
import { LocalDashboard } from "@/components/dashboard/local-dashboard";
import { Note } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "My hub",
  description: "Your locally saved reading progress, bookmarks and Tasbeeh sessions.",
  robots: { index: false, follow: true },
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
          Assalamu Alaikum · السلام علیکم
        </p>
        <h1 className="mt-3 font-display text-[2rem] leading-snug sm:text-[2.25rem]">
          Your local hub
        </h1>
        <p className="mt-2 text-[0.9375rem] text-mute">
          Everything below comes from this browser. No account or database connection is required.
        </p>
      </header>

      <div className="mt-10">
        <LocalDashboard />
      </div>

      <div className="mt-12">
        <Note>
          This data does not sync between devices. Clearing browser site data removes it permanently.
        </Note>
      </div>
    </div>
  );
}
