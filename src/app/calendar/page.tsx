import type { Metadata } from "next";
import { HijriCalendar } from "@/components/tools/hijri-calendar";
import { Note, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Islamic calendar",
  description:
    "Hijri and Gregorian dates side by side, with the notable dates of the current Hijri year.",
  alternates: { canonical: "/calendar" },
};

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Calendar"
        title="Hijri and Gregorian, together"
        description="Dates are converted with the Umm al-Qura calendar built into your browser's internationalisation engine."
      />
      <div className="mt-8">
        <HijriCalendar />
      </div>
      <div className="mt-8">
        <Note tone="gold">
          Islamic calendar dates may vary by a day depending on local moon sighting and the
          convention followed in your country. Confirm dates for fasting and the two Eids with your
          local mosque.
        </Note>
      </div>
    </div>
  );
}
