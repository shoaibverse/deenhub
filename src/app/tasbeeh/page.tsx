import type { Metadata } from "next";
import { TasbeehCounter } from "@/components/tools/tasbeeh-counter";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Digital tasbeeh",
  description: "A quiet counter for your dhikr, with your own targets and locally saved sessions.",
  alternates: { canonical: "/tasbeeh" },
};

export default function TasbeehPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Tasbeeh"
        title="Keep count, quietly"
        description="Your current count and session history are stored only in this browser. No account or database is required."
      />
      <div className="mt-8">
        <TasbeehCounter />
      </div>
    </div>
  );
}
