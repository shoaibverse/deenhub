import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What NoorHub stores, where it is stored, and what it never collects.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Privacy"
        title="What NoorHub stores"
        description="Written plainly, so you can check it against what the app actually does."
      />

      <div className="mt-10 space-y-10 text-[1rem] leading-[1.8]">
        <section>
          <h2 className="font-display text-xl">If you use NoorHub without an account</h2>
          <p className="mt-3">
            Nothing is stored on a server. Your theme, Arabic text size, translation choice, tasbeeh
            count, location choice and recent searches are kept in your browser’s local storage. You
            can clear them at any time from{" "}
            <Link href="/settings" className="link-quiet">
              Settings
            </Link>
            .
          </p>
          <p className="mt-3">
            Prayer times, the qibla bearing and the Hijri calendar are all calculated on your device.
            NoorHub does not send your coordinates to a server.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">If you create an account</h2>
          <p className="mt-3">NoorHub stores:</p>
          <ul className="mt-3 list-inside list-disc space-y-2 text-mute">
            <li>Your email address, display name and a salted password hash.</li>
            <li>A session record so you stay signed in, with an expiry date.</li>
            <li>Your bookmarks: the type, reference and a short excerpt of what you saved.</li>
            <li>Your Quran reading progress: the surah and the last ayah you marked.</li>
            <li>The duas you marked as favourites, by their identifier.</li>
            <li>Your tasbeeh sessions, if you choose to save them.</li>
            <li>Your reading history entries, so the dashboard can show where you left off.</li>
            <li>Your preferences: theme, text size, translation, reciter, prayer method and location.</li>
          </ul>
          <p className="mt-3">
            Passwords are never stored in plain text. Sessions are stored in an http-only cookie and
            are deleted when they expire or when you sign out.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Location</h2>
          <p className="mt-3">
            NoorHub asks for your location only when you choose “Use my location”, and the
            coordinates are used immediately in your browser to calculate prayer times and the qibla
            bearing. If you save them to your account, they are stored so your settings follow you to
            another device. You can clear them at any time.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Messages you send</h2>
          <p className="mt-3">
            The contact form stores your name, email address and message so the maintainers can
            reply. Messages are not published anywhere.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">What NoorHub does not do</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-mute">
            <li>No analytics or tracking of any kind is built into NoorHub.</li>
            <li>No advertising or third-party trackers are included.</li>
            <li>No data is sold or shared with anyone.</li>
            <li>No notifications are sent, and no notification permission is requested.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl">Third-party requests</h2>
          <p className="mt-3">
            Quran text, translations, recitation audio, hadith text and metal prices are fetched from
            the sources listed on the{" "}
            <Link href="/about#sources" className="link-quiet">
              About page
            </Link>
            . Those services see the request, including your IP address, as with any web request.
            Nothing else about you is sent with it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Deleting your data</h2>
          <p className="mt-3">
            Ask through the{" "}
            <Link href="/contact" className="link-quiet">
              contact form
            </Link>{" "}
            and your account record, bookmarks, progress, favourites and sessions will be deleted.
          </p>
        </section>
      </div>
    </div>
  );
}
