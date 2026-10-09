import type { Metadata } from "next";
import { PrayerBoard } from "@/components/prayer/prayer-board";
import { SectionHeading } from "@/components/ui/primitives";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Prayer times",
  description:
    "Prayer times calculated on your device from your location, chosen method and Asr convention.",
  alternates: { canonical: "/prayer" },
};

export default async function PrayerPage() {
  const user = await getSessionUser();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Prayer"
        title="Today's prayer times"
        description="Times are computed locally on your device from your coordinates and calculation method."
      />
      <div className="mt-8">
        <PrayerBoard signedIn={Boolean(user)} />
      </div>
    </div>
  );
}
