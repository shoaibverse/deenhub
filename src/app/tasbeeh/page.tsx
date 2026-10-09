import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TasbeehCounter } from "@/components/tools/tasbeeh-counter";
import { SectionHeading } from "@/components/ui/primitives";
import { getSessionUser } from "@/lib/auth/session";
import { listTasbeehSessions } from "@/db/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Digital tasbeeh",
  description: "A quiet counter for your dhikr, with your own targets and saved sessions.",
  alternates: { canonical: "/tasbeeh" },
};

export default async function TasbeehPage() {
  const user = await getSessionUser();
  const sessions = user ? await listTasbeehSessions(user.id) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Tasbeeh"
        title="Keep count, quietly"
        description="Your count is stored on this device. Sign in to also keep a history of your sessions."
      />
      <div className="mt-8">
        <TasbeehCounter
          signedIn={Boolean(user)}
          history={sessions.map((session) => ({
            id: session.id,
            dhikr: session.dhikr,
            target: session.target,
            count: session.count,
            updatedAt: session.updatedAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}


