import type { Metadata } from "next";
import { BookmarkList } from "@/components/dashboard/bookmark-list";
import { Note, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "The Quran ayahs and hadith saved in this browser.",
  robots: { index: false, follow: true },
};

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Saved locally"
        title="Your bookmarks"
        description="Everything you save is kept in this browser. No account, server database or personal-data connection is used."
      />
      <div className="mt-8">
        <BookmarkList />
      </div>
      <div className="mt-10">
        <Note>
          Browser data can be removed by clearing site storage. Use Settings to clear NoorHub’s local
          data deliberately.
        </Note>
      </div>
    </div>
  );
}
