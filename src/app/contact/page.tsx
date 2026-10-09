import type { Metadata } from "next";
import { ContactForm } from "@/components/pages/contact-form";
import { Note, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a message to the NoorHub team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Contact"
        title="Get in touch"
        description="Report an error in a text, a broken reference, or something that does not work as it should."
      />
      <div className="surface mt-8 rounded-[14px] p-5 sm:p-6">
        <ContactForm contactEmail={process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null} />
      </div>
      <div className="mt-8">
        <Note>
          NoorHub does not store contact messages in a database. The form opens your mail app when a
          contact email is configured; otherwise it only copies your message and clearly states that
          nothing was sent. Religious ruling questions should be taken to a qualified scholar.
        </Note>
      </div>
    </div>
  );
}
