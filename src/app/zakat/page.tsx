import type { Metadata } from "next";
import { ZakatCalculator } from "@/components/tools/zakat-calculator";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Zakat calculator",
  description:
    "Work through your assets and liabilities with a current nisab estimate, entirely in your browser.",
  alternates: { canonical: "/zakat" },
};

export default function ZakatPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Zakat"
        title="Estimate your zakat"
        description="Enter what you hold and what you owe. The calculation runs in your browser and nothing is stored."
      />
      <div className="mt-8">
        <ZakatCalculator />
      </div>
    </div>
  );
}
