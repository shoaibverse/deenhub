import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/settings-form";
import { SectionHeading } from "@/components/ui/primitives";
import { getProfile, getQuranProgress } from "@/db/queries";
import { getPreferences, getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  description: "Appearance, reading, prayer and account settings.",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/settings");

  const [profile, preferences] = await Promise.all([getProfile(user.id), getPreferences()]);
  void getQuranProgress;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Settings"
        title="Make NoorHub yours"
        description="Reading, appearance and prayer settings. Changes apply immediately in this browser."
      />
      <div className="mt-8">
        <SettingsForm
          account={{
            email: user.email,
            displayName: profile?.displayName ?? user.displayName ?? "",
          }}
          saved={{
            prayerMethod: preferences.prayerMethod,
            asrJuristic: preferences.asrJuristic,
            latitude: preferences.latitude,
            longitude: preferences.longitude,
            locationLabel: preferences.locationLabel,
            notifyPrayer: preferences.notifyPrayer,
          }}
        />
      </div>
    </div>
  );
}
