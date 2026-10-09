import type { Metadata } from "next";
import { QiblaFinder } from "@/components/tools/qibla-finder";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Qibla finder",
  description:
    "Find the direction of the Kaaba from your location, with the distance and a compass dial where the device supports it.",
  alternates: { canonical: "/qibla" },
};

export default function QiblaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Qibla"
        title="Direction to the Kaaba"
        description="The bearing is calculated from your coordinates. The compass dial only moves when your device reports orientation."
      />
      <div className="mt-8">
        <QiblaFinder />
      </div>
    </div>
  );
}
