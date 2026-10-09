import { SkeletonLines } from "@/components/ui/primitives";

export default function QuranSearchLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold">
        Quran search
      </p>
      <div className="skeleton mt-4 h-9 w-72" />
      <div className="skeleton mt-8 h-12 w-full" />
      <div className="mt-10 space-y-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-[12px] border border-[color:var(--line)] p-4">
            <div className="skeleton h-5 w-40" />
            <div className="mt-3">
              <SkeletonLines lines={2} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
