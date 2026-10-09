import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings/settings-form";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Settings",
  description: "Appearance, Quran reading, prayer and local privacy settings.",
  robots: { index: false, follow: true },
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Settings"
        title="Make NoorHub yours"
        description="Changes are saved automatically in this browser. No account or database connection is required."
      />
      <div className="mt-8">
        <SettingsForm />
      </div>
    </div>
  );
}
