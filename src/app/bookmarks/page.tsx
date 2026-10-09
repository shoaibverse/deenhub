import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookmarkList } from "@/components/dashboard/bookmark-list";
import { SectionHeading } from "@/components/ui/primitives";
import { getSessionUser } from "@/lib/auth/session";
import { listBookmarks } from "@/db/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "The ayahs, hadith and duas you have saved.",
  robots: { index: false, follow: false },
};

export default async function BookmarksPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/bookmarks");
  const bookmarks = await listBookmarks(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Saved"
        title="Your bookmarks"
        description="Everything you have saved from the Quran, the hadith library and the dua collection."
      />
      <div className="mt-8">
        <BookmarkList bookmarks={bookmarks} />
      </div>
    </div>
  );
}
