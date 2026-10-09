import type { Metadata } from "next";
import Link from "next/link";
import { Note, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What NoorHub keeps in your browser and what it never stores on a server.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Privacy"
        title="Your personal data stays in your browser"
        description="NoorHub does not require an account, authentication service or database connection."
      />

      <div className="mt-10 space-y-10 text-[1rem] leading-[1.8]">
        <Note tone="gold">
          NoorHub is local-first. Bookmarks, favorite duas, Quran progress, reading history, Tasbeeh
          sessions, location and preferences are kept in your browser’s local storage—not in a
          NoorHub database.
        </Note>

        <section>
          <h2 className="font-display text-xl">What stays on this device</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-mute">
            <li>Theme, Arabic text size, translation and reciter choices.</li>
            <li>Prayer calculation method and a location you choose or permit.</li>
            <li>Quran bookmarks, last-read positions and reading history.</li>
            <li>Favorite duas.</li>
            <li>Your current Tasbeeh count and the sessions you choose to save.</li>
            <li>Recent search terms, only when the search dialog stores them.</li>
          </ul>
          <p className="mt-3">
            This information does not automatically move to another browser or device. Clearing site
            storage removes it permanently.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">No accounts or server profiles</h2>
          <p className="mt-3">
            NoorHub does not offer sign-in or registration. It does not store an email address,
            password, profile, session cookie, bookmark record or reading record in a database. The
            application health check also does not connect to a database.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Location</h2>
          <p className="mt-3">
            NoorHub asks for your location only when you select “Use my location”. Coordinates are
            used in the browser to calculate prayer times and the qibla bearing. They remain in local
            storage so your selected location survives a reload. You can clear it from Prayer or
            Settings.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Contact messages</h2>
          <p className="mt-3">
            The contact form does not write to a database. If a public contact email is configured,
            it opens your device’s mail application with the message prepared; you must send it from
            there. If no email is configured, it only copies the message to your clipboard and says
            clearly that nothing was sent.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">External content requests</h2>
          <p className="mt-3">
            Quran text, translations, recitation audio, Tafseer, hadith and metal prices are fetched
            from the attributed providers listed on the{" "}
            <Link href="/about#sources" className="link-quiet">
              source page
            </Link>
            . Those providers receive a normal web request, including your IP address. Personal
            bookmarks, progress, location and Tasbeeh history are not attached to those requests.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Analytics and advertising</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-mute">
            <li>No analytics package is built into NoorHub.</li>
            <li>No advertising or third-party behavioral tracker is included.</li>
            <li>No personal data is sold or shared.</li>
            <li>No push notifications are sent.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl">Clear your data</h2>
          <p className="mt-3">
            Use the “Clear all local data” control in{" "}
            <Link href="/settings" className="link-quiet">
              Settings
            </Link>
            , or clear this site’s storage in your browser. There is no remote copy to request or
            delete.
          </p>
        </section>
      </div>
    </div>
  );
}
